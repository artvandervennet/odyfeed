import { getSessionCookie, clearSessionCookie } from '~~/server/utils/sessionCookie'
import { getUserSessionBySessionId, deleteSessionById } from '~~/server/utils/sessionStorage'
import { logDebug, logInfo } from '~~/server/utils/logger'

export default defineEventHandler(async (event) => {
	const sessionId = getSessionCookie(event)

	if (sessionId) {
		const sessionData = await getUserSessionBySessionId(sessionId)

		if (sessionData) {
			const hasValidToken = !!sessionData.refreshToken && sessionData.refreshToken !== 'mock-refresh-token'

			// Check if session data looks valid
			if (!sessionData.webId || !sessionData.username) {
				logInfo(`[Auth Middleware] Invalid session data for sessionId ${sessionId}, clearing session`)
				await deleteSessionById(sessionId)
				clearSessionCookie(event)
				return
			}

			event.context.auth = {
				sessionId,
				webId: sessionData.webId,
				username: sessionData.username,
				issuer: sessionData.issuer,
				podUrl: sessionData.podUrl,
				hasValidToken,
			}

			logDebug(`[Auth Middleware] Session validated for ${sessionData.username}`)
		} else {
			// Session ID exists but no session data found - clear stale cookie
			logDebug(`[Auth Middleware] No session data found for sessionId, clearing stale cookie`)
			clearSessionCookie(event)
		}
	}
})

declare module 'h3' {
	interface H3EventContext {
		auth?: {
			sessionId: string
			webId: string
			username: string
			issuer: string
			podUrl: string
			hasValidToken: boolean
		}
	}
}
