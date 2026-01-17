import type { ASCollection } from "~~/shared/types/activitypub";
import { NAMESPACES, ACTIVITY_TYPES, ENDPOINT_PATHS, DEFAULTS, FILE_PATHS } from "~~/shared/constants";
import { createDataStorage } from "~~/server/utils/fileStorage";

export default defineEventHandler((event): ASCollection<string> => {
	const params = getRouterParams(event);
	const username = params.username as string;
	const query = getQuery(event);
	const page = query.page;
	const baseUrl = process.env.BASE_URL || DEFAULTS.BASE_URL;
	const storage = createDataStorage();

	const actorFilePath = `${FILE_PATHS.ACTORS_DATA_DIR}/${username}/profile.jsonld`;
	if (!storage.exists(actorFilePath)) {
		throw createError({
			statusCode: 404,
			statusMessage: "Actor not found",
		});
	}

	const inboxUrl = `${baseUrl}${ENDPOINT_PATHS.ACTORS_INBOX(username)}`;

	setHeader(event, 'Content-Type', 'application/activity+json');
	setHeader(event, 'Access-Control-Allow-Origin', '*');

	if (!page) {
		return {
			"@context": NAMESPACES.ACTIVITYSTREAMS,
			id: inboxUrl,
			type: ACTIVITY_TYPES.ORDERED_COLLECTION,
			totalItems: 0,
			first: `${inboxUrl}?page=true`,
			last: `${inboxUrl}?min_id=0&page=true`,
		};
	}

	return {
		"@context": NAMESPACES.ACTIVITYSTREAMS,
		id: `${inboxUrl}?page=true`,
		type: ACTIVITY_TYPES.ORDERED_COLLECTION_PAGE,
		totalItems: 0,
		partOf: inboxUrl,
		orderedItems: [],
	};
});
