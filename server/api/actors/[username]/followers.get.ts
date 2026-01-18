import { listActivitiesFromPod, getActivityFromPod } from "~~/server/utils/podStorage"
import { POD_CONTAINERS, ENDPOINT_PATHS, DEFAULTS } from "~~/shared/constants"
import { logError } from "~~/server/utils/logger"
import { validateActorParams, fetchUserMapping, buildCollection, buildCollectionPage, validatePageParam, setActivityPubHeaders } from "~~/server/utils/actorEndpointHelpers"

export default defineEventHandler(async (event) => {
	const { username } = validateActorParams(event)
	const { webId, podUrl } = fetchUserMapping(username)

	const pageParam = getQuery(event).page as string | undefined
	const pageSize = parseInt(process.env.ACTIVITYPUB_PAGE_SIZE || '20', 10)
	const baseUrl = process.env.BASE_URL || DEFAULTS.BASE_URL
	const followersUrl = `${baseUrl}${ENDPOINT_PATHS.ACTORS_FOLLOWERS(username)}`

	try {
		const followersContainer = `${podUrl}${POD_CONTAINERS.FOLLOWERS}`
		const followerFiles = await listActivitiesFromPod(webId, followersContainer)

		const followerActorIds: string[] = []
		for (const fileUrl of followerFiles) {
			try {
				const followerData = await getActivityFromPod(webId, fileUrl)
				if (followerData && followerData.id) {
					followerActorIds.push(followerData.id)
				}
			} catch (error) {
				logError(`Failed to read follower file: ${fileUrl}`, error)
			}
		}

		followerActorIds.sort()

		const totalItems = followerActorIds.length
		const page = validatePageParam(pageParam)

		if (!page) {
			const collection = buildCollection({
				id: followersUrl,
				type: 'OrderedCollection',
				totalItems,
				first: totalItems > 0 ? `${followersUrl}?page=1` : undefined,
			})

			setActivityPubHeaders(event)
			return collection
		}

		const { pageItems, hasNext, hasPrev } = buildCollectionPage(followersUrl, followerActorIds, page, pageSize)

		const collectionPage = buildCollection({
			id: `${followersUrl}?page=${page}`,
			type: 'OrderedCollectionPage',
			totalItems,
			partOf: followersUrl,
			orderedItems: pageItems,
			next: hasNext ? `${followersUrl}?page=${page + 1}` : undefined,
			prev: hasPrev ? `${followersUrl}?page=${page - 1}` : undefined,
		})

		setActivityPubHeaders(event)
		return collectionPage
	} catch (error) {
		logError(`Failed to fetch followers for ${username}`, error)
		throw createError({
			statusCode: 500,
			statusMessage: 'Failed to fetch followers',
		})
	}
})
