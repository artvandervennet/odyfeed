import { createDataStorage } from "~~/server/utils/fileStorage";
import type { ASCollection } from "~~/shared/types/activitypub";
import { NAMESPACES, ACTIVITY_TYPES, FILE_PATHS, ENDPOINT_PATHS, DEFAULTS } from "~~/shared/constants";

export default defineEventHandler((event): ASCollection<string> => {
	const params = getRouterParams(event);
	const username = params.username as string;
	const baseUrl = process.env.ODYSSEY_BASE_URL || DEFAULTS.BASE_URL;
	const storage = createDataStorage();

	// Check if actor exists
	const actorFilePath = `${FILE_PATHS.ACTORS_DATA_DIR}/${username}/profile.jsonld`;
	if (!storage.exists(actorFilePath)) {
		throw createError({
			statusCode: 404,
			statusMessage: "Actor not found",
		});
	}

	const postsDir = `${FILE_PATHS.POSTS_DIR}/${username}`;
	const postFiles = storage.listFiles(postsDir, ".jsonld");

	const statusUrls = postFiles.map((file) => {
		const postId = file.replace(".jsonld", "");
		return `${baseUrl}${ENDPOINT_PATHS.ACTOR_STATUS(username, postId)}`;
	});

	setHeader(event, 'Content-Type', 'application/activity+json');

	return {
		"@context": NAMESPACES.ACTIVITYSTREAMS,
		id: `${baseUrl}${ENDPOINT_PATHS.ACTORS_OUTBOX(username)}`,
		type: ACTIVITY_TYPES.ORDERED_COLLECTION,
		totalItems: statusUrls.length,
		orderedItems: statusUrls,
	};
});
