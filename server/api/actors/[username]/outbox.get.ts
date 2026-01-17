import { createDataStorage } from "~~/server/utils/fileStorage";
import type { ASCollection, ASNote } from "~~/shared/types/activitypub";
import { NAMESPACES, ACTIVITY_TYPES, FILE_PATHS, ENDPOINT_PATHS, DEFAULTS } from "~~/shared/constants";

export default defineEventHandler((event): ASCollection<any> => {
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

	const postsDir = `${FILE_PATHS.POSTS_DIR}/${username}`;
	const postFiles = storage.listFiles(postsDir, ".jsonld");
	const outboxUrl = `${baseUrl}${ENDPOINT_PATHS.ACTORS_OUTBOX(username)}`;
	const actorId = `${baseUrl}${ENDPOINT_PATHS.ACTORS_PROFILE(username)}`;

	setHeader(event, 'Content-Type', 'application/activity+json');

	if (!page) {
		return {
			"@context": NAMESPACES.ACTIVITYSTREAMS,
			id: outboxUrl,
			type: ACTIVITY_TYPES.ORDERED_COLLECTION,
			totalItems: postFiles.length,
			first: `${outboxUrl}?page=true`,
			last: `${outboxUrl}?min_id=0&page=true`,
		};
	}

	const createActivities = postFiles.map((file) => {
		const postPath = `${postsDir}/${file}`;
		const post = storage.read<ASNote>(postPath);

		return {
			id: `${post.id}/activity`,
			type: ACTIVITY_TYPES.CREATE,
			actor: actorId,
			published: post.published,
			to: post.to,
			cc: post.cc || [`${baseUrl}${ENDPOINT_PATHS.ACTORS_FOLLOWERS(username)}`],
			object: post,
		};
	});

	return {
		"@context": NAMESPACES.ACTIVITYSTREAMS,
		id: `${outboxUrl}?page=true`,
		type: ACTIVITY_TYPES.ORDERED_COLLECTION_PAGE,
		totalItems: createActivities.length,
		partOf: outboxUrl,
		orderedItems: createActivities,
	};
});
