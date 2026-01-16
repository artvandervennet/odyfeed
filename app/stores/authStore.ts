import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { AuthSession } from '~/types/oidc';
import { useActivityPodsAuth } from '~/composables/useActivityPodsAuth';

export const useAuthStore = defineStore('auth', () => {
	const session = ref<AuthSession | null>(null);
	const isLoggedIn = computed<boolean>(() => !!session.value);
	const webId = computed<string>(() => session.value?.webId || "");
	const outbox = ref<string | undefined>(undefined);
	const inbox = ref<string | undefined>(undefined);

	const userProfile = ref<{
		preferredUsername?: string;
		name?: string;
		avatar?: string;
		summary?: string;
	}>({});

	const validatePodCapabilities = async function () {
		if (!session.value?.webId) {
			throw new Error('No authenticated session found');
		}

		try {
			const { fetchWithAuth } = useActivityPodsAuth();
			const response = await fetchWithAuth(session.value, session.value.webId);

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

			userProfile.value = {
				preferredUsername: profile.preferredUsername
					|| profile['http://www.w3.org/ns/activitystreams#preferredUsername']
					|| profile['as:preferredUsername'],
				name: profile.name
					|| profile['http://www.w3.org/ns/activitystreams#name']
					|| profile['as:name']
					|| profile['http://xmlns.com/foaf/0.1/name']
					|| profile['foaf:name'],
				avatar: profile.icon?.url
					|| profile.icon
					|| profile['http://www.w3.org/ns/activitystreams#icon']?.url
					|| profile['as:icon']?.url,
				summary: profile.summary
					|| profile['http://www.w3.org/ns/activitystreams#summary']
					|| profile['as:summary']
			};

			console.log('User profile loaded:', userProfile.value);
		} catch (error) {
			console.warn('Pod validation failed, continuing anyway:', error);
		}
	};

	const initSession = async function () {
		const { getStoredSession, handleCallback, refreshSession } = useActivityPodsAuth();

		const urlParams = new URLSearchParams(window.location.search);
		if (urlParams.has('code')) {
			try {
				const newSession = await handleCallback();
				if (newSession) {
					session.value = newSession;
					await validatePodCapabilities();
				}
			} catch (error) {
				console.error('Failed to handle callback:', error);
			}
			return;
		}

		const storedSession = getStoredSession();
		if (storedSession) {
			if (storedSession.expiresAt < Date.now() + 60000) {
				const refreshedSession = await refreshSession(storedSession);
				if (refreshedSession) {
					session.value = refreshedSession;
				} else {
					session.value = storedSession;
				}
			} else {
				session.value = storedSession;
			}

			try {
				await validatePodCapabilities();
			} catch (error) {
				console.warn('Pod validation encountered an error:', error);
			}
		}
	};

	const startLogin = async function (provider: string) {
		const { startLoginFlow } = useActivityPodsAuth();
		await startLoginFlow(provider);
	};

	const startLogout = async function () {
		if (!session.value) return;

		const { logout } = useActivityPodsAuth();
		await logout(session.value);

		outbox.value = undefined;
		inbox.value = undefined;
		userProfile.value = {};
		session.value = null;
	};

	return {
		isLoggedIn,
		webId,
		session,
		outbox,
		inbox,
		userProfile,
		login: startLogin,
		logout: startLogout,
		initSession,
		validatePodCapabilities
	};
});