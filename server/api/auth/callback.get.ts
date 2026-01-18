import { Session } from '@inrupt/solid-client-authn-node'
import { saveSessionWithId, getPendingSession, deletePendingSession } from '~~/server/utils/sessionStorage'
import { getSessionCookie, setSessionCookie, generateSessionId } from '~~/server/utils/sessionCookie'
import { logInfo, logError, logDebug } from '~~/server/utils/logger'
import { getSharedSolidStorage } from '~~/server/utils/solidStorage'
import { pendingSessions, pendingInruptSessionIds } from './login.get'
import { storeActiveSessionWithId } from '~~/server/utils/solidSession'

const activeSessions = new Map<string, Session>()

export { activeSessions }

export default defineEventHandler(async (event) => {
	const url = getRequestURL(event)
	const tempSessionId = getSessionCookie(event)
	const storage = getSharedSolidStorage()

	let session: Session
	let existingInruptSessionId: string | undefined

	// Try to recover pending session from memory
	if (tempSessionId && pendingSessions.has(tempSessionId)) {
		session = pendingSessions.get(tempSessionId)!
		existingInruptSessionId = pendingInruptSessionIds.get(tempSessionId)
		pendingSessions.delete(tempSessionId)
		pendingInruptSessionIds.delete(tempSessionId)
		logInfo(`[Auth] ✅ Recovered pending session from memory: ${tempSessionId}`)
		if (existingInruptSessionId) {
			logInfo(`[Auth] Using existing Inrupt session ID: ${existingInruptSessionId}`)
		}

		// Clean up persisted metadata
		await deletePendingSession(tempSessionId)
	} else if (tempSessionId) {
		// Fallback: Try to recover from disk (for server restarts)
		const pendingMetadata = await getPendingSession(tempSessionId)

		if (pendingMetadata) {
			logInfo(`[Auth] ✅ Recovered pending session from disk: ${tempSessionId}`)
			logInfo(`[Auth] Inrupt session ID from disk: ${pendingMetadata.inruptSessionId}`)

			existingInruptSessionId = pendingMetadata.inruptSessionId

			// Create session with the SAME storage that has the DPoP keys
			session = new Session({ storage, keepAlive: true })

			// Clean up after successful recovery
			await deletePendingSession(tempSessionId)
		} else {
			// No session found at all - this will likely fail
			session = new Session({ storage, keepAlive: true })
			logError(`[Auth] ⚠️ No pending session found in memory or disk`)
			logError(`[Auth] Cookie session ID: ${tempSessionId}`)
			logError(`[Auth] WARNING: DPoP binding will likely fail - "accountId mismatch" error expected`)
		}
	} else {
		// Create new session with persistent storage
		// IMPORTANT: Use the SAME storage instance to maintain DPoP keys
		session = new Session({ storage, keepAlive: true })
		logInfo(`[Auth] Created new session with persistent storage`)
		logInfo(`[Auth] WARNING: No session cookie found - DPoP binding may fail`)
	}

	// Verify DPoP keys are available in storage
	if (existingInruptSessionId) {
		const dpopKeyStorageKey = `solidClientAuthenticationUser:${existingInruptSessionId}:dpopKey`
		const hasDpopKey = await storage.get(dpopKeyStorageKey)
		logInfo(`[Auth] DPoP key in storage: ${hasDpopKey ? '✅ FOUND' : '❌ MISSING'}`)

		if (!hasDpopKey) {
			logError(`[Auth] CRITICAL: DPoP key missing for session ${existingInruptSessionId}`)
			logError(`[Auth] This will likely cause "accountId mismatch" error from Solid Pod`)
		}
	}

	// Listen for token refresh events
	session.events.on('newTokens', async (tokenSet: any) => {
		logInfo('[Auth] New tokens received from IdP')
		logDebug(`[Auth] Token expiration: ${tokenSet.expirationDate}`)

		if (tokenSet.refreshToken) {
			logInfo('[Auth] ✅ Refresh token received!')

			// Update stored refresh token for this session
			const sessionInfo = session.info as any
			const sessionId = sessionInfo.sessionId
			if (sessionId) {
				try {
					const storageKey = `solidClientAuthenticationUser:${sessionId}`
					const sessionDataRaw = await storage.get(storageKey)
					if (sessionDataRaw) {
						const sessionData = JSON.parse(sessionDataRaw)
						sessionData.refreshToken = tokenSet.refreshToken
						await storage.set(storageKey, JSON.stringify(sessionData))
						logInfo('[Auth] Updated refresh token in storage')
					}
				} catch (error) {
					logError('[Auth] Failed to update refresh token:', error)
				}
			}
		} else {
			logError('[Auth] ⚠️ No refresh token in token set - check scopes and consent')
		}
	})

	try {
		await session.handleIncomingRedirect(url.toString())

		if (!session.info.isLoggedIn) {
			throw new Error('Login failed - session not authenticated')
		}

		const webId = session.info.webId
		if (!webId) {
			throw new Error('No WebID found in session')
		}

		// Extract tokens from session storage (Inrupt stores them internally)
		const sessionInfo = session.info as any
		const sessionId = sessionInfo.sessionId

		// Debug: Log all available session properties
		logInfo(`[Auth] Full session info:`)
		logInfo(`[Auth] - isLoggedIn: ${sessionInfo.isLoggedIn}`)
		logInfo(`[Auth] - webId: ${sessionInfo.webId}`)
		logInfo(`[Auth] - sessionId: ${sessionInfo.sessionId}`)
		logInfo(`[Auth] - clientAppId: ${sessionInfo.clientAppId}`)
		logInfo(`[Auth] Available keys: ${Object.keys(sessionInfo).join(', ')}`)

		// Read the refresh token from storage directly
		let refreshToken = ''
		let clientId = ''
		let clientSecret = ''
		let issuer = ''

		try {
			const storageKey = `solidClientAuthenticationUser:${sessionId}`
			const sessionDataRaw = await storage.get(storageKey)

			if (sessionDataRaw) {
				const sessionData = JSON.parse(sessionDataRaw)
				refreshToken = sessionData.refreshToken || ''
				clientId = sessionData.clientId || ''
				clientSecret = sessionData.clientSecret || ''
				issuer = sessionData.issuer || ''

				logInfo(`[Auth] Retrieved from storage:`)
				logInfo(`[Auth] - refreshToken: ${refreshToken ? '✅ PRESENT' : '❌ MISSING'}`)
				logInfo(`[Auth] - clientId: ${clientId ? '✅ PRESENT' : '❌ MISSING'}`)
				logInfo(`[Auth] - issuer: ${issuer ? '✅ PRESENT' : '❌ MISSING'}`)
			} else {
				logError(`[Auth] No session data found in storage for key: ${storageKey}`)
			}
		} catch (error) {
			logError('[Auth] Error reading session data from storage:', error)
		}

		// If issuer is still missing, try to extract from WebID
		if (!issuer && webId) {
			try {
				const webIdUrl = new URL(webId)
				// For Inrupt, the issuer is typically the base URL
				if (webIdUrl.hostname.includes('inrupt.com')) {
					issuer = 'https://login.inrupt.com'
				} else {
					issuer = `${webIdUrl.protocol}//${webIdUrl.hostname}`
				}
				logInfo(`[Auth] Extracted issuer from WebID: ${issuer}`)
			} catch (error) {
				logError('[Auth] Failed to extract issuer from WebID:', error)
			}
		}

		logInfo(`[Auth] Callback received for WebID: ${webId}`)
		logInfo(`[Auth] Final values:`)
		logInfo(`[Auth] - refreshToken: ${refreshToken ? '✅ PRESENT' : '❌ MISSING'}`)
		logInfo(`[Auth] - clientId: ${clientId || 'using fallback'}`)
		logInfo(`[Auth] - issuer: ${issuer || 'using fallback'}`)

		// Validate refresh token
		if (!refreshToken) {
			logError('[Auth] ❌ CRITICAL: No refresh token received!')
			logError('[Auth] Possible causes:')
			logError('[Auth] 1. offline_access scope not granted by user')
			logError('[Auth] 2. IdP does not support refresh tokens')
			logError('[Auth] 3. Client registration missing refresh_token grant type')
			logError('[Auth] 4. Session storage read error')
		} else {
			logInfo('[Auth] ✅ SUCCESS: Refresh token received - persistent authentication enabled')
		}

		if (!clientId) {
			logError('[Auth] WARNING: No clientId found in session - using fallback')
		}
		if (!issuer) {
			logError('[Auth] WARNING: No issuer found in session')
		}

		// Use fallback values if needed
		const finalClientId = clientId || `${process.env.BASE_URL || 'http://localhost:3000'}/clientid.jsonld`
		const finalRefreshToken = refreshToken || 'mock-refresh-token'
		const finalIssuer = issuer || 'unknown'

		// Discover Pod storage URL using the authenticated session
		let podUrl = ''
		try {
			logInfo(`[Auth] Discovering Pod storage URL from WebID document...`)
			const response = await session.fetch(webId, {
				headers: {
					'Accept': 'text/turtle',
				},
			})

			if (response.ok) {
				const text = await response.text()
				const storageMatch = text.match(/<http:\/\/www\.w3\.org\/ns\/pim\/space#storage>\s+<([^>]+)>/)

				if (storageMatch && storageMatch[1]) {
					podUrl = storageMatch[1]
					logInfo(`[Auth] ✅ Discovered Pod storage URL: ${podUrl}`)
				}
			}
		} catch (error) {
			logError('[Auth] Error discovering Pod URL:', error)
		}

		// Fallback to base URL if discovery failed
		if (!podUrl) {
			const webIdUrl = new URL(webId)
			podUrl = `${webIdUrl.protocol}//${webIdUrl.host}/`
			logInfo(`[Auth] Using fallback Pod URL: ${podUrl}`)
		}

		// Generate permanent session ID
		const permanentSessionId = generateSessionId()

		// Save session data to backend storage with session ID mapping
		await saveSessionWithId(permanentSessionId, webId, {
			webId,
			username: '', // Will be set during registration
			issuer: finalIssuer,
			clientId: finalClientId,
			clientSecret,
			refreshToken: finalRefreshToken,
			podUrl,
		})

		logInfo(`[Auth] Session saved for ${webId} with ${refreshToken ? 'REAL' : 'MOCK'} refresh token`)

		// Store active session with permanent ID and webId mapping
		activeSessions.set(permanentSessionId, session)
		storeActiveSessionWithId(permanentSessionId, webId, session)
		logInfo(`[Auth] Stored active session for sessionId: ${permanentSessionId} and webId: ${webId}`)

		// Set permanent HTTP-only session cookie
		setSessionCookie(event, permanentSessionId, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7, // 7 days
		})

		// Redirect to frontend setup page
		const baseUrl = process.env.BASE_URL || 'http://localhost:3000'
		const frontendRedirect = `${baseUrl}/setup?auth=success&webId=${encodeURIComponent(webId)}`

		return sendRedirect(event, frontendRedirect)
	} catch (error) {
		logError('[Auth] Callback error:', error)
		const baseUrl = process.env.BASE_URL || 'http://localhost:3000'
		return sendRedirect(event, `${baseUrl}/setup?error=${encodeURIComponent((error as Error).message)}`)
	}
})
