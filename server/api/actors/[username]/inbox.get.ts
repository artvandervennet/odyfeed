import type { ASCollection } from "~~/shared/types/activitypub";
import { NAMESPACES, ACTIVITY_TYPES, ENDPOINT_PATHS, DEFAULTS, FILE_PATHS } from "~~/shared/constants";
import { createDataStorage } from "~~/server/utils/fileStorage";

export default defineEventHandler((event): ASCollection<string> => {
	const params = getRouterParams(event);
	const username = params.username as string;
	const baseUrl = process.env.BASE_URL || DEFAULTS.BASE_URL;
	const storage = createDataStorage();

	// Check if actor exists
	const actorFilePath = `${FILE_PATHS.ACTORS_DATA_DIR}/${username}/profile.jsonld`;
	if (!storage.exists(actorFilePath)) {
		throw createError({
			statusCode: 404,
			statusMessage: "Actor not found",
		});
	}

	setHeader(event, 'Content-Type', 'application/activity+json');

	return {
		"@context": NAMESPACES.ACTIVITYSTREAMS,
		id: `${baseUrl}${ENDPOINT_PATHS.ACTORS_INBOX(username)}`,
		type: ACTIVITY_TYPES.ORDERED_COLLECTION,
		totalItems: 0,
		orderedItems: [],
	};
});
