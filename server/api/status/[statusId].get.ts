import { getActivityFromPod } from "~~/server/utils/podStorage"
import { POD_CONTAINERS, FILE_PATHS } from "~~/shared/constants"
import type { ASNote } from "~~/shared/types/activitypub"
import { logInfo, logError } from "~~/server/utils/logger"
import { setActivityPubHeaders } from "~~/server/utils/actorEndpointHelpers"
import { extractNoteFromActivity, checkNoteAuthorization, getAuthenticatedWebId } from "~~/server/utils/authHelpers"
import { createDataStorage } from "~~/server/utils/fileStorage"

export default defineEventHandler(async (event) => {
	const statusId = getRouterParam(event, 'statusId')

	if (!statusId) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Status ID is required',
		})
	}

	try {
		const storage = createDataStorage()
		const mappingsPath = FILE_PATHS.WEBID_MAPPINGS

		if (!storage.exists(mappingsPath)) {
			throw createError({
				statusCode: 404,
				statusMessage: 'No users registered',
			})
		}

		interface WebIdMappings {
			[webId: string]: {
				username: string
				actorId: string
				createdAt: string
			}
		}

		const mappings = storage.read<WebIdMappings>(mappingsPath)
		const registeredUsers = Object.entries(mappings)

		let foundActivity = null
		let foundUsername = null

		for (const [webId, userMapping] of registeredUsers) {
			const username = userMapping.username
			const podUrl = webId.replace('/profile/card#me', '')
			const activityUrl = `${podUrl}${POD_CONTAINERS.OUTBOX}${statusId}.json`

			try {
				const activity = await getActivityFromPod(webId, activityUrl)
				if (activity) {
					foundActivity = activity
					foundUsername = username
					break
				}
			} catch (error) {
				continue
			}
		}

		if (!foundActivity || !foundUsername) {
			throw createError({
				statusCode: 404,
				statusMessage: 'Post not found',
			})
		}

		const extractedNote = extractNoteFromActivity(foundActivity)

		if (extractedNote.type !== 'Note') {
			logInfo(`Activity type ${foundActivity.type} returned as-is for ${statusId}`)
			setActivityPubHeaders(event)
			return foundActivity
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
			logInfo(`Returning public post ${statusId}`)
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

		logInfo(`Returning private post ${statusId} to authorized user ${requestingWebId}`)
		setActivityPubHeaders(event)
		return note
	} catch (error: any) {
		if (error.statusCode) {
			throw error
		}

		logError(`Failed to fetch post ${statusId}`, error)
		throw createError({
			statusCode: 500,
			statusMessage: 'Failed to fetch post',
		})
	}
})
