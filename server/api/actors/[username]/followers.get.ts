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

	const followersPath = `${FILE_PATHS.ACTORS_DATA_DIR}/${username}/followers.json`;
	const followersData = storage.read<{ followers: string[] }>(followersPath);
	const followers = followersData.followers || [];
	const followersUrl = `${baseUrl}${ENDPOINT_PATHS.ACTORS_FOLLOWERS(username)}`;

	setHeader(event, 'Content-Type', 'application/activity+json');

	if (!page) {
		return {
			"@context": NAMESPACES.ACTIVITYSTREAMS,
			id: followersUrl,
			type: ACTIVITY_TYPES.ORDERED_COLLECTION,
			totalItems: followers.length,
			first: `${followersUrl}?page=true`,
			last: `${followersUrl}?min_id=0&page=true`,
		};
	}

	return {
		"@context": NAMESPACES.ACTIVITYSTREAMS,
		id: `${followersUrl}?page=true`,
		type: ACTIVITY_TYPES.ORDERED_COLLECTION_PAGE,
		totalItems: followers.length,
		partOf: followersUrl,
		orderedItems: followers,
	};
});
