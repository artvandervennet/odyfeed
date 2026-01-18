import { listActivitiesFromPod, getActivityFromPod } from "~~/server/utils/podStorage"
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
	const followingUrl = `${baseUrl}${ENDPOINT_PATHS.ACTORS_FOLLOWING(username)}`

	try {
		const followingContainer = `${podUrl}${POD_CONTAINERS.FOLLOWING}`
		const followingFiles = await listActivitiesFromPod(webId, followingContainer)

		const followingActorIds: string[] = []
		for (const fileUrl of followingFiles) {
			try {
				const followingData = await getActivityFromPod(webId, fileUrl)
				if (followingData && followingData.id) {
					followingActorIds.push(followingData.id)
				}
			} catch (error) {
				logError(`Failed to read following file: ${fileUrl}`, error)
			}
		}

		followingActorIds.sort()

		const totalItems = followingActorIds.length
		const page = validatePageParam(pageParam)

		if (!page) {
			const collection = buildCollection({
				id: followingUrl,
				type: 'OrderedCollection',
				totalItems,
				first: totalItems > 0 ? `${followingUrl}?page=1` : undefined,
			})

			setActivityPubHeaders(event)
			return collection
		}

		const { pageItems, hasNext, hasPrev } = buildCollectionPage(followingUrl, followingActorIds, page, pageSize)

		const collectionPage = buildCollection({
			id: `${followingUrl}?page=${page}`,
			type: 'OrderedCollectionPage',
			totalItems,
			partOf: followingUrl,
			orderedItems: pageItems,
			next: hasNext ? `${followingUrl}?page=${page + 1}` : undefined,
			prev: hasPrev ? `${followingUrl}?page=${page - 1}` : undefined,
		})

		setActivityPubHeaders(event)
		return collectionPage
	} catch (error) {
		logError(`Failed to fetch following for ${username}`, error)
		throw createError({
			statusCode: 500,
			statusMessage: 'Failed to fetch following',
		})
	}
})
