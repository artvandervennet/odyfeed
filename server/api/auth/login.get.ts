import { Session } from '@inrupt/solid-client-authn-node'
import { generateSessionId, setSessionCookie } from '~~/server/utils/sessionCookie'
import { getSharedSolidStorage } from '~~/server/utils/solidStorage'
import { logInfo, logError } from '~~/server/utils/logger'

const pendingSessions = new Map<string, Session>()

export default defineEventHandler(async (event) => {
	const query = getQuery(event)
	const issuer = query.issuer as string

	if (!issuer) {
		throw createError({
			statusCode: 400,
			statusMessage: 'issuer parameter is required',
		})
	}

	const storage = getSharedSolidStorage()
	const session = new Session({ storage })
	const sessionId = generateSessionId()
	const baseUrl = process.env.BASE_URL || 'http://localhost:3000'
	const redirectUrl = `${baseUrl}/api/auth/callback`
	const clientId = `${baseUrl}/clientid.jsonld`

	pendingSessions.set(sessionId, session)

	logInfo(`[Auth] Starting login flow with issuer: ${issuer}`)
	logInfo(`[Auth] Client ID: ${clientId}`)
	logInfo(`[Auth] Redirect URL: ${redirectUrl}`)
	logInfo(`[Auth] Note: offline_access scope is included by default`)

	try {
		await session.login({
			oidcIssuer: issuer,
			redirectUrl,
			clientId,
			clientName: 'OdyFeed',
			handleRedirect: (url: string) => {
				setSessionCookie(event, sessionId, { temporary: true })
				logInfo(`[Auth] Redirecting to IdP`)
				sendRedirect(event, url)
			},
		})
	} catch (error) {
		pendingSessions.delete(sessionId)
		logError('[Auth] Login error:', error)
		throw createError({
			statusCode: 500,
			statusMessage: 'Failed to initiate login',
		})
	}
})

export { pendingSessions }

