import { defineStore } from 'pinia';
import {computed, ref} from 'vue';
import {
	login,
	handleIncomingRedirect,
	getDefaultSession,
	logout,
	type Session
} from "@inrupt/solid-client-authn-browser";

export const useAuthStore = defineStore('auth', () => {
	const session = ref<Session | undefined>(undefined);
	const isLoggedIn = computed<boolean>(() => session.value?.info.isLoggedIn || false);
	const webId = computed<string>(() => session.value?.info.webId || "");

	const profile = ref<>();

	const initSession = async () => {
		await handleIncomingRedirect({
			url: window.location.href,
			restorePreviousSession: true
		});
		session.value = getDefaultSession()
		console.log(session.value.info.isLoggedIn);
	}

	const startLogin = async (provider: string) => {
		const redirectUrl = window.location.origin;
		await login({
			oidcIssuer: provider,
			redirectUrl: redirectUrl,
			clientName: "OdyFeed",
		});
	}

	const startLogout = async () => {
		await logout();
	}

	return {
		isLoggedIn,
		webId,
		session,
		login: startLogin,
		logout: startLogout,
		initSession
	}
});