import { listActivitiesFromPod, getActivityFromPod } from '~~/server/utils/podStorage'
import { POD_CONTAINERS } from '~~/shared/constants'
import { logError, logInfo } from '~~/server/utils/logger'
import { validateActorParams, fetchUserMapping } from '~~/server/utils/actorEndpointHelpers'
import { extractNoteFromActivity } from '~~/server/utils/authHelpers'
import type { ASNote, ASActivity } from '~~/shared/types/activitypub'

export default defineEventHandler(async (event) => {
	const { username } = validateActorParams(event)

	try {
		const { webId, podUrl } = fetchUserMapping(username)
		const outboxContainer = `${podUrl}${POD_CONTAINERS.OUTBOX}`

		logInfo(`[Posts] Fetching posts for ${username} from ${outboxContainer}`)

		const activityUrls = await listActivitiesFromPod(webId, outboxContainer)

		if (activityUrls.length === 0) {
			logInfo(`[Posts] No activities found for ${username}`)
			setHeader(event, 'Content-Type', 'application/json')
			return []
		}

		logInfo(`[Posts] Found ${activityUrls.length} activities for ${username}`)

		const posts: ASNote[] = []

		for (const activityUrl of activityUrls) {
			try {
				const activity = await getActivityFromPod(webId, activityUrl)

				if (!activity) {
					logError(`[Posts] Failed to fetch activity (possibly auth issue): ${activityUrl}`)
					continue
				}

				const extractedNote = extractNoteFromActivity(activity as ASActivity)

				if (extractedNote.type !== 'Note') {
					continue
				}

				const note = extractedNote as ASNote

				if (note.inReplyTo) {
					logInfo(`[Posts] Skipping reply to ${note.inReplyTo}`)
					continue
				}

				posts.push(note)
			} catch (error) {
				logError(`[Posts] Failed to process activity ${activityUrl}`, error)
			}
		}

		posts.sort((a, b) => {
			const dateA = new Date(a.published || 0).getTime()
			const dateB = new Date(b.published || 0).getTime()
			return dateB - dateA
		})

		logInfo(`[Posts] Returning ${posts.length} posts for ${username}`)

		setHeader(event, 'Content-Type', 'application/json')

		return posts
	} catch (error) {
		logError(`[Posts] Failed to fetch posts for ${username}`, error)
		throw createError({
			statusCode: 500,
			statusMessage: 'Failed to fetch posts - session may be expired',
		})
	}
})
