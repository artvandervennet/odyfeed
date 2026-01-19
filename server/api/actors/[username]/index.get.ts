import { getActivityFromPod } from "~~/server/utils/podStorage"
import { POD_CONTAINERS } from "~~/shared/constants"
import type { ASActor } from "~~/shared/types/activitypub"
import { logInfo, logError } from "~~/server/utils/logger"
import { validateActorParams, setActivityPubHeaders } from "~~/server/utils/actorEndpointHelpers"
import { getWebIdFromUsername } from "~~/server/utils/actorHelpers"
import { optionalAuth } from "~~/server/utils/authHelpers"

export default defineEventHandler(async (event) => {
	const { username } = validateActorParams(event)
	const auth = optionalAuth(event)
	const isOwner = auth?.username === username

	const userMapping = getWebIdFromUsername(username)

	if (!userMapping) {
		throw createError({
			statusCode: 404,
			statusMessage: 'Actor not found',
		})
	}

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

	throw createError({
		statusCode: 404,
		statusMessage: 'Actor not found',
	})
})
