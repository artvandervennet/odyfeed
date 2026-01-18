import { requireAuth } from "~~/server/utils/authHelpers"
import {
	validateActorParams,
	fetchUserMapping,
	buildCollection,
	validatePageParam,
	setActivityPubHeaders,
	extractStatusIdFromPodUrl,
	transformActivityUrls
} from "~~/server/utils/actorEndpointHelpers"
import { listActivitiesFromPod, getActivityFromPod } from "~~/server/utils/podStorage"
import { POD_CONTAINERS, ENDPOINT_PATHS } from "~~/shared/constants"
import { logError } from "~~/server/utils/logger"

export default defineEventHandler(async (event) => {
	const { webId, username: authUsername } = requireAuth(event)
	const { username } = validateActorParams(event)

	if (username !== authUsername) {
		throw createError({
			statusCode: 403,
			statusMessage: 'You can only access your own inbox',
		})
	}

	const { podUrl } = fetchUserMapping(username)

	const pageParam = getQuery(event).page as string | undefined
	const pageSize = parseInt(process.env.ACTIVITYPUB_PAGE_SIZE || '20', 10)
	const baseUrl = process.env.BASE_URL || 'http://localhost:3000'
	const inboxUrl = `${baseUrl}${ENDPOINT_PATHS.ACTORS_INBOX(username)}`

	try {
		const inboxContainer = `${podUrl}${POD_CONTAINERS.INBOX}`
		const activityUrls = await listActivitiesFromPod(webId, inboxContainer)

		activityUrls.sort().reverse()

		const totalItems = activityUrls.length
		const page = validatePageParam(pageParam)

		if (!page) {
			const collection = buildCollection({
				id: inboxUrl,
				type: 'OrderedCollection',
				totalItems,
				first: totalItems > 0 ? `${inboxUrl}?page=1` : undefined,
			})

			setActivityPubHeaders(event, 0)
			return collection
		}

		const startIndex = (page - 1) * pageSize
		const endIndex = startIndex + pageSize
		const pageUrls = activityUrls.slice(startIndex, endIndex)
		const hasNext = endIndex < totalItems
		const hasPrev = page > 1

		const activities = []
		for (const activityUrl of pageUrls) {
			try {
				const activity = await getActivityFromPod(webId, activityUrl)
				if (activity) {
					const statusId = extractStatusIdFromPodUrl(activityUrl)
					const transformedActivity = transformActivityUrls(activity, baseUrl, username, statusId)
					activities.push(transformedActivity)
				} else {
					logError(`Failed to fetch activity from Pod: ${activityUrl}`)
				}
			} catch (error) {
				logError(`Error fetching activity ${activityUrl}`, error)
			}
		}

		const collectionPage = buildCollection({
			id: `${inboxUrl}?page=${page}`,
			type: 'OrderedCollectionPage',
			totalItems,
			partOf: inboxUrl,
			orderedItems: activities as any,
			next: hasNext ? `${inboxUrl}?page=${page + 1}` : undefined,
			prev: hasPrev ? `${inboxUrl}?page=${page - 1}` : undefined,
		})

		setActivityPubHeaders(event, 0)
		return collectionPage
	} catch (error) {
		logError(`Failed to fetch inbox for ${username}`, error)
		throw createError({
			statusCode: 500,
			statusMessage: 'Failed to fetch inbox',
		})
	}
})
