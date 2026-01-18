import { requireAuth } from "~~/server/utils/authHelpers"
import { validateActorParams, fetchUserMapping, setActivityPubHeaders } from "~~/server/utils/actorEndpointHelpers"
import { saveActivityToPod, getPrivateKeyFromPod } from "~~/server/utils/podStorage"
import { federateActivity } from "~~/server/utils/federation"
import { POD_CONTAINERS, ACTIVITY_TYPES } from "~~/shared/constants"
import { logInfo, logError } from "~~/server/utils/logger"
import type { ASActivity } from "~~/shared/types/activitypub"

export default defineEventHandler(async (event) => {
	const { webId, username: authUsername } = requireAuth(event)
	const { username } = validateActorParams(event)

	if (username !== authUsername) {
		throw createError({
			statusCode: 403,
			statusMessage: 'You can only post to your own outbox',
		})
	}

	const { podUrl, actorId } = fetchUserMapping(username)

	const activity = await readBody<ASActivity>(event)

	if (!activity || !activity.type) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Invalid activity format',
		})
	}

	const allowedTypes = [
		ACTIVITY_TYPES.CREATE,
		ACTIVITY_TYPES.LIKE,
		ACTIVITY_TYPES.FOLLOW,
		ACTIVITY_TYPES.UNDO,
		ACTIVITY_TYPES.ANNOUNCE,
	]

	if (!allowedTypes.includes(activity.type as any)) {
		throw createError({
			statusCode: 400,
			statusMessage: `Activity type ${activity.type} not supported`,
		})
	}

	if (!activity.actor || activity.actor !== actorId) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Activity actor must match authenticated user',
		})
	}

	try {
		const outboxContainer = `${podUrl}${POD_CONTAINERS.OUTBOX}`
		const timestamp = Date.now()
		const slug = `${timestamp}-${activity.type.toLowerCase()}.json`

		const savedUrl = await saveActivityToPod(webId, outboxContainer, activity, slug)

		if (!savedUrl) {
			throw createError({
				statusCode: 500,
				statusMessage: 'Failed to save activity to outbox',
			})
		}

		logInfo(`Activity saved to outbox: ${savedUrl}`)

		const privateKey = await getPrivateKeyFromPod(webId, podUrl)

		if (!privateKey) {
			logError(`No private key found for ${username}, cannot federate`)
			throw createError({
				statusCode: 500,
				statusMessage: 'Private key not found - cannot federate activity',
			})
		}

		const federationResult = await federateActivity(activity, actorId, privateKey)

		logInfo(`Federation result: ${federationResult.successful}/${federationResult.total} delivered`)

		setActivityPubHeaders(event, 0)
		setResponseStatus(event, 201)

		return {
			id: savedUrl,
			type: activity.type,
			federated: {
				total: federationResult.total,
				successful: federationResult.successful,
				failed: federationResult.failed,
			},
		}
	} catch (error: any) {
		if (error.statusCode) {
			throw error
		}

		logError(`Failed to process outbox POST for ${username}`, error)
		throw createError({
			statusCode: 500,
			statusMessage: 'Failed to process activity',
		})
	}
})
