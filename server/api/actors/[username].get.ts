import { createDataStorage } from "~~/server/utils/fileStorage"
import type { ASActor } from "~~/shared/types/activitypub"
import { FILE_PATHS } from "~~/shared/constants"

export default defineEventHandler((event): ASActor | void => {
	const params = getRouterParams(event)
	const username = params.username as string
	const storage = createDataStorage()

	const actorFilePath = `${FILE_PATHS.ACTORS_DATA_DIR}/${username}/profile.jsonld`

	if (!storage.exists(actorFilePath)) {
		throw createError({
			statusCode: 404,
			statusMessage: "Actor not found",
		})
	}

	setHeader(event, "Content-Type", "application/activity+json")
	return storage.read<ASActor>(actorFilePath)
})
