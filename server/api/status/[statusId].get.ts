import { getActivityFromPod, listActivitiesFromPod } from "~~/server/utils/podStorage"
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

		const baseUrl = process.env.BASE_URL || 'http://localhost:3000'
		const targetUrl = `${baseUrl}/api/status/${statusId}`

		let foundActivity = null
		let foundUsername = null

		logInfo(`[Status] Looking for post with ID: ${targetUrl}`)

		// Search through all users' outboxes
		for (const [webId, userMapping] of registeredUsers) {
			const username = userMapping.username
			const podUrl = webId.replace('/profile/card#me', '')
			const outboxContainer = `${podUrl}${POD_CONTAINERS.OUTBOX}`

			try {
				const activityUrls = await listActivitiesFromPod(webId, outboxContainer)

				// Check each activity
				for (const activityUrl of activityUrls) {
					try {
						const activity = await getActivityFromPod(webId, activityUrl)

						if (!activity) continue

						// Check multiple ID fields
						const activityId = activity.id
						const objectId = activity.object?.id
						const objectUrl = activity.object?.url

						// Match by full URL or by ending path
						if (activityId === targetUrl ||
						    objectId === targetUrl ||
						    objectUrl === targetUrl ||
						    activityId?.endsWith(`/status/${statusId}`) ||
						    objectId?.endsWith(`/status/${statusId}`) ||
						    objectUrl?.endsWith(`/status/${statusId}`)) {
							foundActivity = activity
							foundUsername = username
							logInfo(`[Status] Found matching activity: ${activityUrl}`)
							break
						}
					} catch (error) {
						continue
					}
				}

				if (foundActivity) break
			} catch (error) {
				logError(`[Status] Error searching ${username}'s outbox`, error)
				continue
			}
		}

		if (!foundActivity || !foundUsername) {
			logError(`[Status] Post not found: ${statusId}`)
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
