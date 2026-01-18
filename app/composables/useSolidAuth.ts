import { login, handleIncomingRedirect, getDefaultSession, logout, type Session } from "@inrupt/solid-client-authn-browser"
import { computed, ref } from 'vue'

export const useSolidAuth = function () {
	const session = ref<Session>(getDefaultSession())
	const isLoggedIn = computed(() => session.value.info.isLoggedIn)
	const webId = computed(() => session.value.info.webId || '')

	const solidLogin = async function (issuer: string): Promise<void> {
		if (!issuer) {
			throw new Error('OIDC issuer is required')
		}

		await login({
			oidcIssuer: issuer,
			redirectUrl: `${window.location.origin}/callback`,
			clientName: "OdyFeed",
		})
	}

	const handleRedirect = async function (): Promise<boolean> {
		try {
			console.log('[Solid Auth] Calling handleIncomingRedirect...')
			await handleIncomingRedirect({
				restorePreviousSession: true,
			})
			session.value = getDefaultSession()
			console.log('[Solid Auth] Redirect handled')
			console.log('[Solid Auth] - isLoggedIn:', session.value.info.isLoggedIn)
			console.log('[Solid Auth] - webId:', session.value.info.webId)
			console.log('[Solid Auth] - sessionId:', session.value.info.sessionId)
			return session.value.info.isLoggedIn
		} catch (error) {
			console.error('[Solid Auth] Error handling redirect:', error)
			return false
		}
	}

	const solidLogout = async function (): Promise<void> {
		await logout()
		session.value = getDefaultSession()
		console.log('[Solid Auth] Logged out')
	}

	const getAccessToken = function (): string | undefined {
		return session.value.info.isLoggedIn ? session.value.info.sessionId : undefined
	}

	const fetchWithAuth = async function (url: string, options: RequestInit = {}): Promise<Response> {
		if (!session.value.info.isLoggedIn) {
			throw new Error('Not authenticated')
		}

		return session.value.fetch(url, options)
	}

	return {
		session,
		isLoggedIn,
		webId,
		solidLogin,
		handleRedirect,
		solidLogout,
		getAccessToken,
		fetchWithAuth,
	}
}
