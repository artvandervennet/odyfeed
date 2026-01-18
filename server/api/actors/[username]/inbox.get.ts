import { requireAuth } from "~~/server/utils/authHelpers"
import { validateActorParams, fetchUserMapping, buildCollection, buildCollectionPage, validatePageParam, setActivityPubHeaders } from "~~/server/utils/actorEndpointHelpers"
import { listActivitiesFromPod } from "~~/server/utils/podStorage"
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
	const config = useRuntimeConfig()
	const pageSize = parseInt(config.activitypubPageSize as string, 10) || 20
	const baseUrl = config.public.baseUrl
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

		const { pageItems, hasNext, hasPrev } = buildCollectionPage(inboxUrl, activityUrls, page, pageSize)

		const collectionPage = buildCollection({
			id: `${inboxUrl}?page=${page}`,
			type: 'OrderedCollectionPage',
			totalItems,
			partOf: inboxUrl,
			orderedItems: pageItems,
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
