import { getActivityFromPod } from "~~/server/utils/podStorage"
import { POD_CONTAINERS } from "~~/shared/constants"
import type { ASNote } from "~~/shared/types/activitypub"
import { logInfo, logError } from "~~/server/utils/logger"
import { validateActorParams, fetchUserMapping, setActivityPubHeaders } from "~~/server/utils/actorEndpointHelpers"
import { extractNoteFromActivity, checkNoteAuthorization, getAuthenticatedWebId } from "~~/server/utils/authHelpers"

export default defineEventHandler(async (event) => {
	if (event.method === 'OPTIONS') {
		setHeader(event, 'Access-Control-Allow-Origin', '*')
		setHeader(event, 'Access-Control-Allow-Methods', 'GET, OPTIONS')
		setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Accept, Signature, Date, Digest')
		setHeader(event, 'Access-Control-Max-Age', 86400)
		return ''
	}

	const { username, statusId } = validateActorParams(event, true)
	const { webId, podUrl } = fetchUserMapping(username)

	try {
		const activityUrl = `${podUrl}${POD_CONTAINERS.OUTBOX}${statusId}.json`
		const activity = await getActivityFromPod(webId, activityUrl)

		if (!activity) {
			throw createError({
				statusCode: 404,
				statusMessage: 'Post not found',
			})
		}

		const extractedNote = extractNoteFromActivity(activity)

		if (extractedNote.type !== 'Note') {
			logInfo(`Activity type ${activity.type} returned as-is for ${username}/${statusId}`)
			setActivityPubHeaders(event)
			return activity
		}

		const note = extractedNote as ASNote

		if (!note.to) {
			throw createError({
				statusCode: 404,
				statusMessage: 'Invalid post data',
			})
		}

		const requestingWebId = getAuthenticatedWebId(event)
		const { isPublic, isAuthorized } = checkNoteAuthorization(note, requestingWebId)

		if (isPublic) {
			logInfo(`Returning public post ${username}/${statusId}`)
			setActivityPubHeaders(event)
			return note
		}

		if (!requestingWebId) {
			throw createError({
				statusCode: 401,
				statusMessage: 'Authentication required to view this post',
			})
		}

		if (!isAuthorized) {
			throw createError({
				statusCode: 403,
				statusMessage: 'You are not authorized to view this post',
			})
		}

		logInfo(`Returning private post ${username}/${statusId} to authorized user ${requestingWebId}`)
		setActivityPubHeaders(event)
		return note
	} catch (error: any) {
		if (error.statusCode) {
			throw error
		}

		logError(`Failed to fetch post ${username}/${statusId}`, error)
		throw createError({
			statusCode: 500,
			statusMessage: 'Failed to fetch post',
		})
	}
})
