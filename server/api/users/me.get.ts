import { createDataStorage } from "~~/server/utils/fileStorage"
import { FILE_PATHS } from "~~/shared/constants"

interface WebIdMappings {
	[webId: string]: {
		username: string
		actorId: string
		createdAt: string
	}
}

export default defineEventHandler((event) => {
	const webId = getQuery(event).webId as string

	if (!webId) {
		throw createError({
			statusCode: 400,
			statusMessage: "webId query parameter is required",
		})
	}

	const storage = createDataStorage()
	const mappingsPath = FILE_PATHS.WEBID_MAPPINGS

	if (!storage.exists(mappingsPath)) {
		throw createError({
			statusCode: 404,
			statusMessage: "User not found",
		})
	}

	const mappings = storage.read<WebIdMappings>(mappingsPath)
	const userMapping = mappings[webId]

	if (!userMapping) {
		throw createError({
			statusCode: 404,
			statusMessage: "User not found",
		})
	}

	return {
		webId,
		username: userMapping.username,
		actorId: userMapping.actorId,
		createdAt: userMapping.createdAt,
	}
})
