import { clearSessionCookie } from '~~/server/utils/sessionCookie'
import { deleteSessionById } from '~~/server/utils/sessionStorage'
import { logInfo } from '~~/server/utils/logger'

export default defineEventHandler(async (event) => {
	const auth = event.context.auth

	if (auth?.sessionId) {
		await deleteSessionById(auth.sessionId)
		logInfo(`[Auth] Session deleted for ${auth.username || auth.webId}`)
	}

	clearSessionCookie(event)

	return { success: true }
})
