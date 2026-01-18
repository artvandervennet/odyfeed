import { Session } from '@inrupt/solid-client-authn-node'
import { generateSessionId, setSessionCookie } from '~~/server/utils/sessionCookie'
import { getSharedSolidStorage } from '~~/server/utils/solidStorage'
import { savePendingSession } from '~~/server/utils/sessionStorage'
import { logInfo, logError, logDebug } from '~~/server/utils/logger'

const pendingSessions = new Map<string, Session>()
const pendingInruptSessionIds = new Map<string, string>()

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
	const session = new Session({ storage, keepAlive: true })
	const cookieSessionId = generateSessionId()
	const baseUrl = process.env.BASE_URL || 'http://localhost:3000'
	const redirectUrl = `${baseUrl}/api/auth/callback`
	const clientId = `${baseUrl}/clientid.jsonld`

	logInfo(`[Auth] Starting login flow with issuer: ${issuer}`)
	logInfo(`[Auth] Cookie Session ID: ${cookieSessionId}`)
	logInfo(`[Auth] Client ID: ${clientId}`)
	logInfo(`[Auth] Redirect URL: ${redirectUrl}`)
	logInfo(`[Auth] Note: offline_access scope is included by default`)

	try {
		await session.login({
			oidcIssuer: issuer,
			redirectUrl,
			clientId,
			clientName: 'OdyFeed',
			handleRedirect: async (url: string) => {
				const sessionInfo = session.info as any
				const inruptSessionId = sessionInfo.sessionId

				if (inruptSessionId) {
					pendingInruptSessionIds.set(cookieSessionId, inruptSessionId)

					// Persist to disk for production reliability
					await savePendingSession(cookieSessionId, inruptSessionId, issuer)

					logInfo(`[Auth] Stored Inrupt session ID: ${inruptSessionId}`)
					logInfo(`[Auth] ✅ Session metadata persisted to disk`)
					logDebug(`[Auth] DPoP keys and session state persisted to storage`)
				} else {
					logError(`[Auth] WARNING: No Inrupt session ID found - this may cause issues`)
				}

				pendingSessions.set(cookieSessionId, session)
				setSessionCookie(event, cookieSessionId, { temporary: true })
				logInfo(`[Auth] Redirecting to IdP: ${issuer}`)
				sendRedirect(event, url)
			},
		})
	} catch (error) {
		pendingSessions.delete(cookieSessionId)
		pendingInruptSessionIds.delete(cookieSessionId)
		logError('[Auth] Login error:', error)
		throw createError({
			statusCode: 500,
			statusMessage: 'Failed to initiate login',
		})
	}
})

export { pendingSessions, pendingInruptSessionIds }

