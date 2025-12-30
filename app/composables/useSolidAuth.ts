import { login, handleIncomingRedirect, getDefaultSession } from "@inrupt/solid-client-authn-browser";

export function useSolidAuth() {
	const session = getDefaultSession();
	const isLoggedIn = ref(false);

	async function solidLogin() {
		const issuer = prompt("Enter your Pod provider (e.g., https://activitypods.org or https://login.inrupt.com)", "https://login.inrupt.com");
		if (!issuer) return;

		await login({
			oidcIssuer: issuer,
			redirectUrl: window.location.href,
			clientName: "OdyFeed"
		});
	}

	async function handleRedirect() {
		await handleIncomingRedirect();
		isLoggedIn.value = session.info.isLoggedIn;
		return isLoggedIn.value;
	}

	return { solidLogin, handleRedirect, isLoggedIn, session };
}
