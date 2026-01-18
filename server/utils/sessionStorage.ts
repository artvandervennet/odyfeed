import { createDataStorage } from './fileStorage'
import { createHash } from 'crypto'

interface UserSessionData {
	webId: string
	username: string
	issuer: string
	clientId: string
	clientSecret: string
	refreshToken: string
	podUrl: string
	createdAt: string
	updatedAt: string
}

const hashWebId = function (webId: string): string {
	return createHash('sha256').update(webId).digest('hex')
}

export const saveUserSession = async function (webId: string, data: Omit<UserSessionData, 'createdAt' | 'updatedAt'>): Promise<void> {
	const storage = createDataStorage()
	const hashedId = hashWebId(webId)
	const sessionPath = `sessions/${hashedId}.json`

	const sessionData: UserSessionData = {
		...data,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	}

	storage.write(sessionPath, sessionData, { pretty: true })
}

export const getUserSession = async function (webId: string): Promise<UserSessionData | null> {
	const storage = createDataStorage()
	const hashedId = hashWebId(webId)
	const sessionPath = `sessions/${hashedId}.json`

	if (!storage.exists(sessionPath)) {
		return null
	}

	return storage.read<UserSessionData>(sessionPath)
}

export const deleteUserSession = async function (webId: string): Promise<void> {
	const storage = createDataStorage()
	const hashedId = hashWebId(webId)
	const sessionPath = `sessions/${hashedId}.json`

	if (storage.exists(sessionPath)) {
		const { unlinkSync } = await import('fs')
		const { resolve } = await import('path')
		const fullPath = resolve(process.cwd(), 'data', sessionPath)
		unlinkSync(fullPath)
	}
}

// Session ID mapping for cookie-based lookup
const SESSION_ID_MAP_PATH = 'sessions/session-id-map.json'

interface SessionIdMap {
	[sessionId: string]: string // sessionId -> webId mapping
}

export const saveSessionWithId = async function (
	sessionId: string,
	webId: string,
	data: Omit<UserSessionData, 'createdAt' | 'updatedAt'>
): Promise<void> {
	// Save session data with hashed WebID
	await saveUserSession(webId, data)

	// Save sessionId -> webId mapping
	const storage = createDataStorage()
	let map: SessionIdMap = {}

	if (storage.exists(SESSION_ID_MAP_PATH)) {
		map = storage.read<SessionIdMap>(SESSION_ID_MAP_PATH)
	}

	map[sessionId] = webId
	storage.write(SESSION_ID_MAP_PATH, map, { pretty: true })
}

export const getUserSessionBySessionId = async function (
	sessionId: string
): Promise<UserSessionData | null> {
	const storage = createDataStorage()

	if (!storage.exists(SESSION_ID_MAP_PATH)) {
		return null
	}

	const map = storage.read<SessionIdMap>(SESSION_ID_MAP_PATH)
	const webId = map[sessionId]

	if (!webId) {
		return null
	}

	return getUserSession(webId)
}

export const deleteSessionById = async function (sessionId: string): Promise<void> {
	const storage = createDataStorage()

	if (!storage.exists(SESSION_ID_MAP_PATH)) {
		return
	}

	const map = storage.read<SessionIdMap>(SESSION_ID_MAP_PATH)
	const webId = map[sessionId]

	if (webId) {
		await deleteUserSession(webId)
		delete map[sessionId]
		storage.write(SESSION_ID_MAP_PATH, map, { pretty: true })
	}
}

