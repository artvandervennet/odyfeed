import type { ASActor } from "~~/shared/types/activitypub"
import { ENDPOINT_PATHS, ACTIVITYPUB_CONTEXT, ACTIVITY_TYPES } from "~~/shared/constants"
import type { MythActor } from "~~/shared/types/activitypub"

interface ActorProfileData {
	username: string
	baseUrl: string
	isMatchedActor: boolean
	matchingActor?: MythActor
	webId: string
	avatar?: string
	name?: string
	summary?: string
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
	} = data

	const actorId = `${baseUrl}${ENDPOINT_PATHS.ACTORS_PROFILE(username)}`

	return {
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
}

export const validateUsername = function (username: string): boolean {
	return /^[a-z0-9_-]+$/.test(username)
}

export const extractPodUrlFromWebId = function (webId: string): string {
	const webIdUrl = new URL(webId)
	return `${webIdUrl.protocol}//${webIdUrl.host}/`
}
