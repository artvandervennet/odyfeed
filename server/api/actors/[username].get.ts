import { parseActors } from "~~/server/utils/rdf"
import type { MythActor } from "~~/shared/types/activitypub"

export default defineEventHandler((event): MythActor | null => {
	const params = getRouterParams(event)
	const username = params.username as string
	const actors = parseActors()

	const actor = actors.find((a) => a.preferredUsername === username)

	if (!actor) {
		throw createError({
			statusCode: 404,
			statusMessage: "Actor not found",
		})
	}

	return actor
})
