import { login, handleIncomingRedirect, getDefaultSession } from "@inrupt/solid-client-authn-browser";

export function useSolidAuth() {
	async function solidLogin() {
		await login({
			oidcIssuer: "https://login.inrupt.com",
			redirectUrl: window.location.href,
			clientName: "OdyFeed"
		});
	}

	async function handleRedirect() {
		await handleIncomingRedirect();
		const session = getDefaultSession();
		return session.info.isLoggedIn;
	}

	return { solidLogin, handleRedirect };
}
