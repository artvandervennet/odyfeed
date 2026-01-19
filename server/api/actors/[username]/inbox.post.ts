import { validateActorParams, fetchUserMapping } from "~~/server/utils/actorEndpointHelpers"
import { saveActivityToPod, getPrivateKeyFromPod, addLikeToPost, removeLikeFromPost, addReplyToPost } from "~~/server/utils/podStorage"
import { verifyHttpSignature } from "~~/server/utils/httpSignature"
import { generateAcceptActivity, sendActivityToInbox, dereferenceActor } from "~~/server/utils/federation"
import { POD_CONTAINERS, ACTIVITY_TYPES } from "~~/shared/constants"
import { logInfo, logError, logDebug } from "~~/server/utils/logger"
import type { ASActivity, ASNote } from "~~/shared/types/activitypub"
import { generateUUID } from "~~/server/utils/crypto"

export default defineEventHandler(async (event) => {
	const { username } = validateActorParams(event)
	const { webId, podUrl, actorId } = fetchUserMapping(username)

	const body = await readBody(event)

	if (!body || typeof body !== 'object') {
		throw createError({
			statusCode: 400,
			statusMessage: 'Invalid request body',
		})
	}

	const bodyString = JSON.stringify(body)

	const { verified, actorId: senderActorId } = await verifyHttpSignature(event, bodyString)

	if (!verified) {
		logError(`Failed to verify HTTP signature for inbox POST to ${username}`)
		throw createError({
			statusCode: 401,
			statusMessage: 'Invalid or missing HTTP signature',
		})
	}

	logInfo(`✅ Verified signature from ${senderActorId}`)

	const activity = body as ASActivity

	if (!activity || !activity.type || !activity.actor) {
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
		ACTIVITY_TYPES.ACCEPT,
	]

	if (!allowedTypes.includes(activity.type as any)) {
		logDebug(`Ignoring unsupported activity type: ${activity.type}`)
		setResponseStatus(event, 202)
		return { status: 'ignored', reason: 'unsupported activity type' }
	}

	try {
		const inboxContainer = `${podUrl}${POD_CONTAINERS.INBOX}`
		const uuid = generateUUID()
		const slug = `${uuid}.json`

		const savedUrl = await saveActivityToPod(webId, inboxContainer, activity, slug)

		if (!savedUrl) {
			throw createError({
				statusCode: 500,
				statusMessage: 'Failed to save activity to inbox',
			})
		}

		logInfo(`Activity saved to inbox: ${savedUrl}`)

		if (activity.type === ACTIVITY_TYPES.FOLLOW) {
			logInfo(`Received Follow request from ${activity.actor}, sending Accept`)

			const privateKey = await getPrivateKeyFromPod(webId, podUrl)

			if (!privateKey) {
				logError(`No private key found for ${username}, cannot send Accept`)
			} else {
				const acceptActivity = generateAcceptActivity(activity, actorId, actorId)

				const followerActor = await dereferenceActor(activity.actor)

				if (followerActor?.inbox) {
					const sent = await sendActivityToInbox(
						followerActor.inbox,
						acceptActivity,
						actorId,
						privateKey
					)

					if (sent) {
						logInfo(`✅ Sent Accept activity to ${followerActor.inbox}`)

						const followersContainer = `${podUrl}${POD_CONTAINERS.FOLLOWERS}`
						const followerSlug = `${activity.actor.split('/').pop()}.json`
						await saveActivityToPod(webId, followersContainer, activity, followerSlug)
						logInfo(`Saved follower to ${followersContainer}`)
					} else {
						logError(`Failed to send Accept activity to ${followerActor.inbox}`)
					}
				} else {
					logError(`Could not find inbox for follower ${activity.actor}`)
				}
			}
		}

		if (activity.type === ACTIVITY_TYPES.LIKE) {
			logInfo(`Received Like activity from ${activity.actor} for object ${activity.object}`)

			if (typeof activity.object === 'string') {
				const postUrl = activity.object
				const urlParts = postUrl.split('/')
				const postStatusId = urlParts[urlParts.length - 1]

				if (postStatusId) {
					const outboxContainer = `${podUrl}${POD_CONTAINERS.OUTBOX}`
					const postActivityUrl = `${outboxContainer}${postStatusId}.json`

					const updated = await addLikeToPost(webId, postActivityUrl, activity.actor)

					if (updated) {
						logInfo(`✅ Updated post ${postStatusId} with like from ${activity.actor}`)
					} else {
						logError(`Failed to update post ${postStatusId} with like`)
					}
				}
			}
		}

		if (activity.type === ACTIVITY_TYPES.UNDO) {
			logInfo(`Received Undo activity from ${activity.actor}`)

			const undoObject = activity.object as any
			if (undoObject && undoObject.type === ACTIVITY_TYPES.LIKE) {
				logInfo(`Processing Undo Like from ${activity.actor} for object ${undoObject.object}`)

				if (typeof undoObject.object === 'string') {
					const postUrl = undoObject.object
					const urlParts = postUrl.split('/')
					const postStatusId = urlParts[urlParts.length - 1]

					if (postStatusId) {
						const outboxContainer = `${podUrl}${POD_CONTAINERS.OUTBOX}`
						const postActivityUrl = `${outboxContainer}${postStatusId}.json`

						const updated = await removeLikeFromPost(webId, postActivityUrl, activity.actor)

						if (updated) {
							logInfo(`✅ Updated post ${postStatusId} by removing like from ${activity.actor}`)
						} else {
							logError(`Failed to update post ${postStatusId} to remove like`)
						}
					}
				}
			}
		}

		if (activity.type === ACTIVITY_TYPES.CREATE) {
			logInfo(`Received Create activity from ${activity.actor}`)

			const activityObject = activity.object as any
			if (activityObject && activityObject.type === 'Note' && activityObject.inReplyTo) {
				const replyNote = activityObject as ASNote
				const inReplyTo = replyNote.inReplyTo

				logInfo(`Processing reply from ${activity.actor} to ${inReplyTo}`)

				if (typeof inReplyTo === 'string') {
					const urlParts = inReplyTo.split('/')
					const parentStatusId = urlParts[urlParts.length - 1]

					if (parentStatusId) {
						const outboxContainer = `${podUrl}${POD_CONTAINERS.OUTBOX}`
						const parentPostActivityUrl = `${outboxContainer}${parentStatusId}.json`

						const updated = await addReplyToPost(webId, parentPostActivityUrl, replyNote.id)

						if (updated) {
							logInfo(`✅ Updated post ${parentStatusId} with reply ${replyNote.id}`)
						} else {
							logError(`Failed to update post ${parentStatusId} with reply`)
						}
					}
				}
			}
		}

		setResponseStatus(event, 202)
		return {
			status: 'accepted',
			type: activity.type,
			id: savedUrl,
		}
	} catch (error: any) {
		if (error.statusCode) {
			throw error
		}

		logError(`Failed to process inbox POST for ${username}`, error)
		throw createError({
			statusCode: 500,
			statusMessage: 'Failed to process activity',
		})
	}
})
