// import { login, handleIncomingRedirect, getDefaultSession, logout } from "@inrupt/solid-client-authn-browser";
//
// export function useSolidAuth() {
// 	let session = getDefaultSession();
// 	const isLoggedIn = computed(() => session.info.isLoggedIn);
//
// 	async function solidLogin(issuer: string) {
// 		if (!issuer) return;
//
// 		await login({
// 			oidcIssuer: issuer,
// 			redirectUrl: window.location.origin,
// 			clientName: "OdyFeed",
//
// 		});
// 	}
//
// 	async function handleRedirect() {
// 		try {
// 			await handleIncomingRedirect({
// 				restorePreviousSession: true,
// 			});
// 			session = getDefaultSession();
// 			console.log('Redirect handled', session);
// 			return session.info.isLoggedIn;
// 		} catch (error) {
// 			console.error('Error handling redirect:', error);
// 			return false;
// 		}
// 	}
//
// 	async function solidLogout() {
// 		await logout();
// 	}
//
// 	return { solidLogin, handleRedirect, solidLogout, isLoggedIn, session };
// }
