import { saveSessionWithId, getUserSessionBySessionId } from "~~/server/utils/sessionStorage"
import { ensurePodContainers, getPodStorageUrl, saveActivityToPod, saveActorProfileToPod, saveTypeIndicesToPod, savePrivateKeyToPod } from "~~/server/utils/podStorage"
import { parseActors, parseEvents } from "~~/server/utils/rdf"
import { generatePostsForActor, generatePostActivity } from "~~/server/utils/postGenerator"
import { createDataStorage } from "~~/server/utils/fileStorage"
import { ENDPOINT_PATHS, FILE_PATHS, DEFAULTS, POD_CONTAINERS, NAMESPACES, ACTIVITY_TYPES } from "~~/shared/constants"
import { logInfo, logError } from "~~/server/utils/logger"
import type { ASActor } from "~~/shared/types/activitypub"
import { generatePublicTypeIndex, generatePrivateTypeIndex } from "~~/server/utils/typeIndexGenerator"
import { createActorProfile, validateUsername, extractPodUrlFromWebId } from "~~/server/utils/actorHelpers"
import { generateActorKeyPair } from "~~/server/utils/crypto"

interface RegisterRequest {
	username: string
	name?: string
	avatar?: string
	summary?: string
}

interface WebIdMappings {
	[webId: string]: {
		username: string
		actorId: string
		createdAt: string
	}
}

export default defineEventHandler(async (event) => {
	const body = await readBody<RegisterRequest>(event)
	const auth = event.context.auth
	const storage = createDataStorage()
	const baseUrl = process.env.BASE_URL || DEFAULTS.BASE_URL

	// Authentication required
	if (!auth || !auth.webId) {
		throw createError({
			statusCode: 401,
			statusMessage: 'Authentication required - please login first',
		})
	}

	if (!body.username) {
		throw createError({
			statusCode: 400,
			statusMessage: "username is required",
		})
	}

	const username = body.username.toLowerCase().trim()
	const webId = auth.webId

	if (!validateUsername(username)) {
		throw createError({
			statusCode: 400,
			statusMessage: "Username must contain only lowercase letters, numbers, hyphens, and underscores",
		})
	}

	// Load session data (contains real tokens from OAuth)
	const sessionData = await getUserSessionBySessionId(auth.sessionId)

	if (!sessionData) {
		throw createError({
			statusCode: 500,
			statusMessage: 'Session data not found - please login again',
		})
	}

	const {
		refreshToken,
		clientId,
		clientSecret,
		issuer,
		podUrl: sessionPodUrl,
	} = sessionData

	const mappingsPath = FILE_PATHS.WEBID_MAPPINGS
	let mappings: WebIdMappings = {}

	if (storage.exists(mappingsPath)) {
		mappings = storage.read<WebIdMappings>(mappingsPath)
	}

	if (mappings[webId]) {
		const existing = mappings[webId]
		logInfo(`WebID already registered: ${webId} -> ${existing.username}`)
		return {
			success: true,
			username: existing.username,
			actorId: existing.actorId,
			message: "WebID already registered",
		}
	}

	for (const existingWebId in mappings) {
		if (mappings[existingWebId].username === username) {
			throw createError({
				statusCode: 409,
				statusMessage: "Username already taken",
			})
		}
	}

	const mythActors = parseActors()
	const matchingActor = mythActors.find((a: any) => a.preferredUsername === username)
	const isMatchedActor = !!matchingActor

	if (isMatchedActor) {
		logInfo(`Registering mythological actor: ${username} (${matchingActor.name})`)
	} else {
		logInfo(`Registering new user: ${username} (not a mythological actor)`)
	}

	const actorId = `${baseUrl}${ENDPOINT_PATHS.ACTORS_PROFILE(username)}`

	mappings[webId] = {
		username,
		actorId,
		createdAt: new Date().toISOString(),
	}
	storage.write(mappingsPath, mappings, { pretty: true })

	// Check for mock token
	const isMockToken = refreshToken === 'mock-refresh-token' || !refreshToken

	if (isMockToken) {
		logInfo(`Using mock refresh token for ${username} - Pod operations will be skipped`)
	}

	// Update session with username
	await saveSessionWithId(auth.sessionId, webId, {
		webId,
		username,
		issuer,
		clientId,
		clientSecret,
		refreshToken,
		podUrl: sessionPodUrl || '',
	})

	let podUrl = sessionPodUrl || ''
	let podInitialized = false

	if (!isMockToken) {
		// Try to get Pod URL if not already discovered
		if (!podUrl) {
			podUrl = await getPodStorageUrl(webId) || ''

			if (!podUrl) {
				logError(`Could not discover Pod storage URL for ${username}, using fallback`)
				podUrl = extractPodUrlFromWebId(webId)
			}

			// Update session with discovered Pod URL
			await saveSessionWithId(auth.sessionId, webId, {
				webId,
				username,
				issuer,
				clientId,
				clientSecret,
				refreshToken,
				podUrl,
			})
		}

		podInitialized = await ensurePodContainers(webId, podUrl)
		if (!podInitialized) {
			logError(`Failed to initialize Pod containers for ${username}`)
		}
	} else {
		logInfo(`Skipping Pod initialization for ${username} due to mock token`)
	}

	if (podUrl && podInitialized) {
		logInfo(`Pod containers initialized for ${username} at ${podUrl}`)
	}

	const { publicKey, privateKey } = generateActorKeyPair()
	logInfo(`Generated RSA key pair for ${username}`)

	const actorProfile: ASActor = createActorProfile({
		username,
		baseUrl,
		isMatchedActor,
		matchingActor,
		webId,
		avatar: body.avatar,
		name: body.name,
		summary: body.summary,
		publicKey,
	})

	if (podUrl && podInitialized) {
		const keySaved = await savePrivateKeyToPod(webId, podUrl, privateKey)
		if (!keySaved) {
			logError(`Failed to save private key to Pod for ${username}`)
		} else {
			logInfo(`Private key saved to Pod for ${username}`)
		}

		const profileSaved = await saveActorProfileToPod(webId, podUrl, actorProfile)
		if (!profileSaved) {
			logError(`Failed to save actor profile to Pod for ${username}`)
		} else {
			logInfo(`Actor profile saved to Pod: ${profileSaved}`)
		}

		const publicTypeIndex = generatePublicTypeIndex(podUrl, [
			{
				forClass: `${NAMESPACES.ACTIVITYSTREAMS}Person`,
				instance: `${podUrl}${POD_CONTAINERS.ACTIVITYPUB_PROFILE}`,
			},
			{
				forClass: `${NAMESPACES.ACTIVITYSTREAMS}OrderedCollection`,
				instance: `${baseUrl}${ENDPOINT_PATHS.ACTORS_OUTBOX(username)}`,
			},
			{
				forClass: `${NAMESPACES.ACTIVITYSTREAMS}Collection`,
				instance: `${baseUrl}${ENDPOINT_PATHS.ACTORS_FOLLOWERS(username)}`,
			},
		])

		const privateTypeIndex = generatePrivateTypeIndex(podUrl, [
			{
				forClass: `${NAMESPACES.ACTIVITYSTREAMS}Activity`,
				instanceContainer: `${podUrl}${POD_CONTAINERS.ACTIVITIES}`,
			},
		])

		const typeIndicesSaved = await saveTypeIndicesToPod(webId, podUrl, publicTypeIndex, privateTypeIndex)
		if (typeIndicesSaved) {
			logInfo(`Type indices created for ${username}`)
		} else {
			logError(`Failed to create type indices for ${username}`)
		}
	} else {
		logInfo(`Skipping Pod profile/type index creation for ${username} (no valid Pod URL)`)
	}

	if (isMatchedActor) {
		logInfo(`Matched actor detected: ${username}. Starting event seeding process...`)

		const allEvents = parseEvents()
		const relevantEvents = allEvents.filter(event =>
			event.actors.some(actor => actor.preferredUsername === username)
		)

		logInfo(`Found ${relevantEvents.length} events involving actor ${username}`)

		if (relevantEvents.length > 0 && podUrl && podInitialized) {
			try {
				const postResults = await generatePostsForActor(matchingActor, relevantEvents)

				const outboxContainer = `${podUrl}${POD_CONTAINERS.OUTBOX}`
				let savedCount = 0

				for (const result of postResults) {
					if (result.status === "created" && result.note) {
						const eventId = result.eventId
						const slug = `${eventId}.json`

						const activity = generatePostActivity(result.note, actorId)

						const savedUrl = await saveActivityToPod(webId, outboxContainer, activity, slug)
						if (savedUrl) {
							savedCount++
							logInfo(`Saved post to Pod: ${savedUrl}`)
						}
					}
				}

				logInfo(`Successfully saved ${savedCount}/${postResults.length} posts to Pod for ${username}`)

				setResponseStatus(event, 201)
				return {
					success: true,
					username,
					actorId,
					inbox: `${baseUrl}${ENDPOINT_PATHS.ACTORS_INBOX(username)}`,
					outbox: `${baseUrl}${ENDPOINT_PATHS.ACTORS_OUTBOX(username)}`,
					actor: matchingActor.name,
					postsGenerated: savedCount,
					isMatchedActor: true,
				}
			} catch (error) {
				logError(`Failed to generate posts for ${username}`, error)
				throw createError({
					statusCode: 500,
					statusMessage: "Failed to generate posts for actor",
				})
			}
		} else if (relevantEvents.length > 0) {
			logInfo(`Found ${relevantEvents.length} events for ${username}, but skipping seeding (no valid Pod)`)
		} else {
			logInfo(`No events found for actor ${username}. Skipping post generation.`)
		}
	}

	logInfo(`Registration completed for ${username}`)

	setResponseStatus(event, 201)
	return {
		success: true,
		username,
		actorId,
		inbox: `${baseUrl}${ENDPOINT_PATHS.ACTORS_INBOX(username)}`,
		outbox: `${baseUrl}${ENDPOINT_PATHS.ACTORS_OUTBOX(username)}`,
		actor: isMatchedActor ? matchingActor.name : undefined,
		postsGenerated: 0,
		isMatchedActor,
	}
})



