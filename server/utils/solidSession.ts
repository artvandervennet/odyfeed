import { Session } from '@inrupt/solid-client-authn-node'
import { getUserSession, saveUserSession } from './sessionStorage'
import { logInfo, logError, logDebug } from './logger'
import { getSharedSolidStorage } from './solidStorage'

const activeSessions = new Map<string, Session>()
const sessionIdToWebId = new Map<string, string>()

export const storeActiveSession = function (webId: string, session: Session): void {
	activeSessions.set(webId, session)
	logDebug(`[Session] Stored active session for ${webId}`)
}

export const storeActiveSessionWithId = function (sessionId: string, webId: string, session: Session): void {
	activeSessions.set(webId, session)
	sessionIdToWebId.set(sessionId, webId)
	logDebug(`[Session] Stored active session for sessionId: ${sessionId} -> webId: ${webId}`)
}

export const getActiveSessionByWebId = function (webId: string): Session | null {
	const session = activeSessions.get(webId)
	if (session && session.info.isLoggedIn) {
		return session
	}
	return null
}

export const getActiveSessionBySessionId = function (sessionId: string): Session | null {
	const webId = sessionIdToWebId.get(sessionId)
	if (!webId) {
		return null
	}
	return getActiveSessionByWebId(webId)
}

export const hydrateSession = async function (webId: string): Promise<Session | null> {
	// First, check if we already have an active authenticated session
	if (activeSessions.has(webId)) {
		const existingSession = activeSessions.get(webId)!
		if (existingSession.info.isLoggedIn) {
			logDebug(`✅ Reusing existing authenticated session for ${webId}`)
			return existingSession
		}
		// Session exists but not logged in anymore, remove it
		logInfo(`Removing stale session for ${webId} - no longer logged in`)
		activeSessions.delete(webId)

		// Also clean up the sessionId mapping if it exists
		const entries = Array.from(sessionIdToWebId.entries())
		for (const [sessionId, mappedWebId] of entries) {
			if (mappedWebId === webId) {
				sessionIdToWebId.delete(sessionId)
				break
			}
		}
	}

	const userData = await getUserSession(webId)
	if (!userData) {
		logError(`No session data found for WebID: ${webId}`)
		return null
	}

	logInfo(`Attempting to hydrate session for ${userData.username}`)
	logInfo(`Session data: issuer=${userData.issuer}, clientId=${userData.clientId}, hasRefreshToken=${!!userData.refreshToken}`)

	// Check for mock token
	const isMockToken = userData.refreshToken === 'mock-refresh-token' || !userData.refreshToken
	if (isMockToken) {
		logError(`Mock refresh token detected for ${userData.username} - cannot hydrate session for Pod operations`)
		return null
	}

	try {
		// Use persistent storage for token rotation
		const storage = getSharedSolidStorage()
		const session = new Session({ storage, keepAlive: true })

		// Listen for token refresh events
		session.events.on('newTokens', (tokenSet: any) => {
			logDebug(`[Session] Token refreshed for ${userData.username}`)
			logDebug(`[Session] New expiration: ${tokenSet.expirationDate}`)

			// Update stored refresh token if a new one is provided
			if (tokenSet.refreshToken && tokenSet.refreshToken !== userData.refreshToken) {
				logInfo(`[Session] New refresh token received, updating storage`)
				saveUserSession(webId, {
					...userData,
					refreshToken: tokenSet.refreshToken,
				}).catch(error => {
					logError(`[Session] Failed to update refresh token in storage:`, error)
				})
			}
		})

		// Login with refresh token - this enables automatic token refresh
		await session.login({
			clientId: userData.clientId,
			clientSecret: userData.clientSecret,
			refreshToken: userData.refreshToken,
			oidcIssuer: userData.issuer,
		})

		if (session.info.isLoggedIn) {
			activeSessions.set(webId, session)
			logInfo(`✅ Session hydrated successfully for ${userData.username}`)
			return session
		}

		logError(`Failed to hydrate session for ${userData.username} - session.info.isLoggedIn is false`)
		return null
	} catch (error) {
		logError(`Error hydrating session for ${webId}`, error)

		// If it's a token/auth error, the session may be expired - clear it from cache
		const errorMessage = (error as Error).message?.toLowerCase() || ''
		if (errorMessage.includes('token') || errorMessage.includes('auth') || errorMessage.includes('expired')) {
			logInfo(`[Session] Detected expired/invalid session for ${webId}, clearing from cache`)
			activeSessions.delete(webId)
		}

		return null
	}
}

export const getAuthenticatedFetch = async function (webId: string): Promise<typeof fetch | null> {
	const session = await hydrateSession(webId)
	if (!session || !session.info.isLoggedIn) {
		logError(`Cannot get authenticated fetch for ${webId} - session not available`)
		return null
	}

	// The session.fetch automatically handles token refresh if needed
	logDebug(`Returning authenticated fetch for ${webId}`)
	return session.fetch
}

export const clearSessionCache = function (webId: string): void {
	activeSessions.delete(webId)

	// Also clean up the sessionId mapping
	const entries = Array.from(sessionIdToWebId.entries())
	for (const [sessionId, mappedWebId] of entries) {
		if (mappedWebId === webId) {
			sessionIdToWebId.delete(sessionId)
		}
	}

	logInfo(`Session cache cleared for ${webId}`)
}

export const clearAllSessionCaches = function (): void {
	activeSessions.clear()
	sessionIdToWebId.clear()
	logInfo('All session caches cleared')
}
