import type { ASActor } from "~~/shared/types/activitypub"
import { ENDPOINT_PATHS, ACTIVITYPUB_CONTEXT, ACTIVITY_TYPES, FILE_PATHS } from "~~/shared/constants"
import type { MythActor } from "~~/shared/types/activitypub"
import { createDataStorage } from "./fileStorage"
import { logError } from "./logger"

interface ActorProfileData {
	username: string
	baseUrl: string
	isMatchedActor: boolean
	matchingActor?: MythActor
	webId: string
	avatar?: string
	name?: string
	summary?: string
	publicKey?: string
}

interface UserMapping {
	username: string
	actorId: string
	createdAt: string
}

interface WebIdMappings {
	[webId: string]: UserMapping
}

export const createActorProfile = function (data: ActorProfileData): ASActor {
	const {
		username,
		baseUrl,
		isMatchedActor,
		matchingActor,
		avatar,
		name,
		summary,
		publicKey,
	} = data

	const actorId = `${baseUrl}${ENDPOINT_PATHS.ACTORS_PROFILE(username)}`

	const profile: ASActor = {
		"@context": ACTIVITYPUB_CONTEXT as unknown as string,
		id: actorId,
		type: ACTIVITY_TYPES.PERSON,
		preferredUsername: username,
		name: isMatchedActor ? matchingActor!.name : (name || username),
		summary: isMatchedActor ? matchingActor!.summary : (summary || ""),
		inbox: `${baseUrl}${ENDPOINT_PATHS.ACTORS_INBOX(username)}`,
		outbox: `${baseUrl}${ENDPOINT_PATHS.ACTORS_OUTBOX(username)}`,
		followers: `${baseUrl}${ENDPOINT_PATHS.ACTORS_FOLLOWERS(username)}`,
		following: `${baseUrl}${ENDPOINT_PATHS.ACTORS_FOLLOWING(username)}`,
		icon: isMatchedActor ? matchingActor!.icon : (avatar ? { type: ACTIVITY_TYPES.IMAGE, url: avatar } : undefined),
		image: isMatchedActor ? matchingActor!.image : undefined,
		url: actorId,
		published: new Date().toISOString(),
	}

	if (publicKey) {
		profile.publicKey = {
			id: `${actorId}#main-key`,
			owner: actorId,
			publicKeyPem: publicKey,
		}
	}

	return profile
}

export const validateUsername = function (username: string): boolean {
	return /^[a-z0-9_-]+$/.test(username)
}

export const extractPodUrlFromWebId = function (webId: string): string {
	const webIdUrl = new URL(webId)
	return `${webIdUrl.protocol}//${webIdUrl.host}/`
}

export const getWebIdFromUsername = function (username: string): { webId: string; podUrl: string; actorId: string } | null {
	try {
		const storage = createDataStorage()
		const mappingsPath = FILE_PATHS.WEBID_MAPPINGS

		if (!storage.exists(mappingsPath)) {
			return null
		}

		const mappings = storage.read<WebIdMappings>(mappingsPath)

		for (const [webId, mapping] of Object.entries(mappings)) {
			if (mapping.username === username) {
				const podUrl = extractPodUrlFromWebId(webId)
				return {
					webId,
					podUrl,
					actorId: mapping.actorId,
				}
			}
		}

		return null
	} catch (error) {
		logError(`Failed to get webId for username: ${username}`, error)
		return null
	}
}

