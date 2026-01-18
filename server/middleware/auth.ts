import { getSessionCookie } from '~~/server/utils/sessionCookie'
import { getUserSessionBySessionId } from '~~/server/utils/sessionStorage'

export default defineEventHandler(async (event) => {
	const sessionId = getSessionCookie(event)

	if (sessionId) {
		const sessionData = await getUserSessionBySessionId(sessionId)

		if (sessionData) {
			event.context.auth = {
				sessionId,
				webId: sessionData.webId,
				username: sessionData.username,
				issuer: sessionData.issuer,
				podUrl: sessionData.podUrl,
				hasValidToken: !!sessionData.refreshToken && sessionData.refreshToken !== 'mock-refresh-token',
			}
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
