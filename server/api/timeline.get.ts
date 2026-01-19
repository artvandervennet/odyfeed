import { createDataStorage } from '~~/server/utils/fileStorage'
import { parseActors, parseEvents } from '~~/server/utils/rdf'
import { FILE_PATHS, POD_CONTAINERS } from '~~/shared/constants'
import { logError, logInfo } from '~~/server/utils/logger'
import { listActivitiesFromPod, getActivityFromPod } from '~~/server/utils/podStorage'
import { extractNoteFromActivity } from '~~/server/utils/authHelpers'
import type { ASNote, EnrichedPost, ASActivity, MythActor } from '~~/shared/types/activitypub'

interface WebIdMappings {
	[webId: string]: {
		username: string
		actorId: string
		createdAt: string
	}
}

const extractPodUrlFromWebId = function (webId: string): string {
	const webIdUrl = new URL(webId)
	return `${webIdUrl.protocol}//${webIdUrl.host}/`
}

export default defineEventHandler(async (event) => {
	try {
		const storage = createDataStorage()
		const mythActors = parseActors()
		const mythEvents = parseEvents()
		const mappingsPath = FILE_PATHS.WEBID_MAPPINGS

		logInfo('[Timeline] Starting timeline fetch from Solid Pods')

	if (!storage.exists(mappingsPath)) {
		logInfo('[Timeline] No registered users found - returning empty timeline')
		setHeader(event, 'Content-Type', 'application/json')
		setHeader(event, 'Cache-Control', 'public, max-age=60')
		return {
			orderedItems: [],
			totalItems: 0,
			groupedByEvent: [],
		}
	}

		const mappings = storage.read<WebIdMappings>(mappingsPath)
		const registeredUsers = Object.entries(mappings)

		logInfo(`[Timeline] Found ${registeredUsers.length} registered user(s)`)

		const mythActorUsernames = mythActors.map(actor => actor.preferredUsername)
		logInfo(`[Timeline] Myth actors: ${mythActorUsernames.join(', ')}`)

		const allPosts: EnrichedPost[] = []

		for (const [webId, userMapping] of registeredUsers) {
			const username = userMapping.username

			if (!mythActorUsernames.includes(username)) {
				logInfo(`[Timeline] Skipping non-myth user: ${username}`)
				continue
			}

			logInfo(`[Timeline] Processing myth actor user: ${username}`)

			try {
				const podUrl = extractPodUrlFromWebId(webId)
				const outboxContainer = `${podUrl}${POD_CONTAINERS.OUTBOX}`

				logInfo(`[Timeline] Fetching outbox for ${username} from ${outboxContainer}`)

				const activityUrls = await listActivitiesFromPod(webId, outboxContainer)

				if (activityUrls.length === 0) {
					logInfo(`[Timeline] No activities found for ${username}`)
					continue
				}

				logInfo(`[Timeline] Found ${activityUrls.length} activities for ${username}`)

				for (const activityUrl of activityUrls) {
					try {
						const activity = await getActivityFromPod(webId, activityUrl)

						if (!activity) {
							logError(`[Timeline] Failed to fetch activity: ${activityUrl}`)
							continue
						}

						const extractedNote = extractNoteFromActivity(activity as ASActivity)

						if (extractedNote.type !== 'Note') {
							continue
						}

						const note = extractedNote as ASNote

						if (note.inReplyTo) {
							logInfo(`[Timeline] Skipping reply to ${note.inReplyTo}`)
							continue
						}

						const matchingMythActor = mythActors.find(
							(a) => a.preferredUsername === username
						)

						const actorProfile: MythActor = matchingMythActor || {
							id: userMapping.actorId,
							preferredUsername: username,
							name: username,
							summary: '',
							tone: '',
							avatar: '',
							inbox: '',
							outbox: '',
						}

						const enrichedPost: EnrichedPost = {
							...note,
							actor: actorProfile,
						}

						allPosts.push(enrichedPost)
					} catch (error) {
						logError(`[Timeline] Failed to process activity ${activityUrl}`, error)
					}
				}

				logInfo(`[Timeline] Processed activities for ${username}`)
			} catch (error) {
				logError(`[Timeline] Failed to fetch posts for ${username}`, error)
			}
		}

		allPosts.sort((a, b) => {
			const dateA = new Date(a.published || 0).getTime()
			const dateB = new Date(b.published || 0).getTime()
			return dateB - dateA
		})

		const groupedByEvent = mythEvents.map(event => {
			const eventPosts = allPosts.filter(post => {
				const postEventUrl = (post as any)['myth:aboutEvent']
				return postEventUrl === event.id
			})

			return {
				event,
				posts: eventPosts,
			}
		}).filter(group => group.posts.length > 0)

		logInfo(`[Timeline] Returning ${allPosts.length} total posts grouped into ${groupedByEvent.length} events`)

		setHeader(event, 'Content-Type', 'application/json')
		setHeader(event, 'Cache-Control', 'public, max-age=60')

		return {
			orderedItems: allPosts,
			totalItems: allPosts.length,
			groupedByEvent,
		}
	} catch (error) {
		logError('[Timeline] Failed to fetch timeline', error)
		throw createError({
			statusCode: 500,
			statusMessage: 'Failed to fetch timeline',
		})
	}
})
