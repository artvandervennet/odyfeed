import { listActivitiesFromPod, getActivityFromPod } from "~~/server/utils/podStorage"
import { POD_CONTAINERS, ENDPOINT_PATHS } from "~~/shared/constants"
import { logError, logInfo } from "~~/server/utils/logger"
import {
	validateActorParams,
	fetchUserMapping,
	buildCollection,
	validatePageParam,
	setActivityPubHeaders,
	extractStatusIdFromPodUrl,
	transformActivityUrls
} from "~~/server/utils/actorEndpointHelpers"

export default defineEventHandler(async (event) => {
	if (event.method === 'OPTIONS') {
		setHeader(event, 'Access-Control-Allow-Origin', '*')
		setHeader(event, 'Access-Control-Allow-Methods', 'GET, OPTIONS')
		setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Accept, Signature, Date, Digest')
		setHeader(event, 'Access-Control-Max-Age', 86400)
		return ''
	}

	const { username } = validateActorParams(event)
	const { webId, podUrl } = fetchUserMapping(username)

	const pageParam = getQuery(event).page as string | undefined
	const pageSize = parseInt(process.env.ACTIVITYPUB_PAGE_SIZE || '20', 10)
	const baseUrl = process.env.BASE_URL || 'http://localhost:3000'
	const outboxUrl = `${baseUrl}${ENDPOINT_PATHS.ACTORS_OUTBOX(username)}`

	try {
		const outboxContainer = `${podUrl}${POD_CONTAINERS.OUTBOX}`
		const activityUrls = await listActivitiesFromPod(webId, outboxContainer)

		activityUrls.sort().reverse()

		const totalItems = activityUrls.length
		const page = validatePageParam(pageParam)

		if (!page) {
			const collection = buildCollection({
				id: outboxUrl,
				type: 'OrderedCollection',
				totalItems,
				first: totalItems > 0 ? `${outboxUrl}?page=1` : undefined,
			})

			setActivityPubHeaders(event, 60)
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
			id: `${outboxUrl}?page=${page}`,
			type: 'OrderedCollectionPage',
			totalItems,
			partOf: outboxUrl,
			orderedItems: activities as any,
			next: hasNext ? `${outboxUrl}?page=${page + 1}` : undefined,
			prev: hasPrev ? `${outboxUrl}?page=${page - 1}` : undefined,
		})

		setActivityPubHeaders(event, 60)
		return collectionPage
	} catch (error) {
		logError(`Failed to fetch outbox for ${username}`, error)
		throw createError({
			statusCode: 500,
			statusMessage: 'Failed to fetch outbox',
		})
	}
})
