import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import {
	login,
	handleIncomingRedirect,
	getDefaultSession,
	logout,
	type Session
} from "@inrupt/solid-client-authn-browser";
import { getThing, getUrl } from "@inrupt/solid-client";

export const useAuthStore = defineStore('auth', () => {
	const session = ref<Session | undefined>(undefined);
	const isLoggedIn = computed<boolean>(() => session.value?.info.isLoggedIn || false);
	const webId = computed<string>(() => session.value?.info.webId || "");
	const outbox = ref<string | undefined>(undefined);
	const inbox = ref<string | undefined>(undefined);

	const validatePodCapabilities = async function () {
		if (!session.value?.info.isLoggedIn || !session.value?.info.webId) {
			throw new Error('No authenticated session found');
		}

		try {
			const response = await session.value.fetch(session.value.info.webId, {
				headers: {
					'Accept': 'application/ld+json, application/json'
				}
			});

			if (!response.ok) {
				console.warn('Failed to fetch WebID profile, continuing anyway');
				return;
			}

			const profile = await response.json();

			const outboxUrl = profile['http://www.w3.org/ns/activitystreams#outbox']
				|| profile['as:outbox']
				|| profile.outbox;

			const inboxUrl = profile['http://www.w3.org/ns/activitystreams#inbox']
				|| profile['as:inbox']
				|| profile.inbox;

			if (!outboxUrl) {
				console.warn('No ActivityStreams outbox found - this is a generic Solid Pod. Some features may not work.');
			} else {
				outbox.value = typeof outboxUrl === 'string' ? outboxUrl : outboxUrl['@id'] || outboxUrl.id;
				console.log('ActivityPods outbox detected:', outbox.value);
			}

			if (inboxUrl) {
				inbox.value = typeof inboxUrl === 'string' ? inboxUrl : inboxUrl?.['@id'] || inboxUrl?.id;
				console.log('ActivityPods inbox detected:', inbox.value);
			}
		} catch (error) {
			console.warn('Pod validation failed, continuing anyway:', error);
		}
	};

	const initSession = async function () {
		await handleIncomingRedirect({
			url: window.location.href,
			restorePreviousSession: true
		});
		session.value = getDefaultSession();

		if (session.value?.info.isLoggedIn) {
			try {
				await validatePodCapabilities();
			} catch (error) {
				console.warn('Pod validation encountered an error:', error);
			}
		}
	};

	const startLogin = async function (provider: string) {
		const redirectUrl = window.location.href;
		console.log('Redirecting to login page:', redirectUrl);
		await login({
			oidcIssuer: provider,
			redirectUrl: redirectUrl,
			clientName: "OdyFeed",
		});
	};

	const startLogout = async function () {
		await logout();
		outbox.value = undefined;
		inbox.value = undefined;
		session.value = getDefaultSession();
	};

	return {
		isLoggedIn,
		webId,
		session,
		outbox,
		inbox,
		login: startLogin,
		logout: startLogout,
		initSession,
		validatePodCapabilities
	};
});