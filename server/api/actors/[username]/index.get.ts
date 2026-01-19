import { createActorProfile } from "~~/server/utils/actorHelpers"
import { getActivityFromPod } from "~~/server/utils/podStorage"
import { parseActors } from "~~/server/utils/rdf"
import { POD_CONTAINERS, DEFAULTS } from "~~/shared/constants"
import type { ASActor } from "~~/shared/types/activitypub"
import { logInfo, logError } from "~~/server/utils/logger"
import { validateActorParams, setActivityPubHeaders } from "~~/server/utils/actorEndpointHelpers"
import { getWebIdFromUsername } from "~~/server/utils/actorHelpers"
import { optionalAuth } from "~~/server/utils/authHelpers"

export default defineEventHandler(async (event) => {
	const { username } = validateActorParams(event)
	const baseUrl = process.env.BASE_URL || DEFAULTS.BASE_URL
	const auth = optionalAuth(event)
	const isOwner = auth?.username === username

	const userMapping = getWebIdFromUsername(username)

	if (userMapping) {
		const { webId, podUrl } = userMapping

		try {
			const activityPubProfileUrl = `${podUrl}${POD_CONTAINERS.ACTIVITYPUB_PROFILE}`
			const profileData = await getActivityFromPod(webId, activityPubProfileUrl)

			if (profileData && profileData.id) {
				logInfo(`Retrieved actor profile from Pod for ${username}${isOwner ? ' (owner)' : ''}`)
				setActivityPubHeaders(event)
				return profileData as ASActor
			}
		} catch (error) {
			logError(`Failed to fetch profile from Pod for ${username}`, error)
		}
	}

	const mythActors = parseActors()
	const matchingActor = mythActors.find((a) => a.preferredUsername === username)

	if (matchingActor) {
		logInfo(`Returning mythological actor profile for ${username}${isOwner ? ' (owner)' : ''}`)
		const actorProfile = createActorProfile({
			username,
			baseUrl,
			isMatchedActor: true,
			matchingActor,
			webId: userMapping?.webId || '',
			avatar: matchingActor.avatar,
			name: matchingActor.name,
			summary: matchingActor.summary,
		})

		setActivityPubHeaders(event)
		return actorProfile
	}

	throw createError({
		statusCode: 404,
		statusMessage: 'Actor not found',
	})
})
