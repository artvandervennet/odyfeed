import { listActivitiesFromPod } from "~~/server/utils/podStorage"
import { POD_CONTAINERS, ENDPOINT_PATHS } from "~~/shared/constants"
import { logError } from "~~/server/utils/logger"
import { validateActorParams, fetchUserMapping, buildCollection, buildCollectionPage, validatePageParam, setActivityPubHeaders } from "~~/server/utils/actorEndpointHelpers"

export default defineEventHandler(async (event) => {
	const { username } = validateActorParams(event)
	const { webId, podUrl } = fetchUserMapping(username)

	const pageParam = getQuery(event).page as string | undefined
	const config = useRuntimeConfig()
	const pageSize = parseInt(config.activitypubPageSize as string, 10) || 20
	const baseUrl = config.public.baseUrl
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

		const { pageItems, hasNext, hasPrev } = buildCollectionPage(outboxUrl, activityUrls, page, pageSize)

		const collectionPage = buildCollection({
			id: `${outboxUrl}?page=${page}`,
			type: 'OrderedCollectionPage',
			totalItems,
			partOf: outboxUrl,
			orderedItems: pageItems,
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
