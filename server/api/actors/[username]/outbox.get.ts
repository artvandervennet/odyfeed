import { createDataStorage } from "~~/server/utils/fileStorage";
import type { ASCollection, ASNote } from "~~/shared/types/activitypub";
import { NAMESPACES, ACTIVITYPUB_CONTEXT, ACTIVITY_TYPES, FILE_PATHS, ENDPOINT_PATHS, DEFAULTS } from "~~/shared/constants";

const escapeHtml = function (text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
};

const formatContentAsHtml = function (content: string): string {
	const escaped = escapeHtml(content);
	return `<p>${escaped}</p>`;
};

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
	setHeader(event, 'Access-Control-Allow-Origin', '*');

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

		const statusId = file.replace('.jsonld', '');
		const statusUrl = `${baseUrl}${ENDPOINT_PATHS.ACTOR_STATUS(username, statusId)}`;
		const conversationId = `${baseUrl}/contexts/${username}-${statusId}`;

		const htmlContent = formatContentAsHtml(post.content);

		return {
			id: `${post.id}/activity`,
			type: ACTIVITY_TYPES.CREATE,
			actor: actorId,
			published: post.published,
			to: post.to,
			cc: post.cc || [`${baseUrl}${ENDPOINT_PATHS.ACTORS_FOLLOWERS(username)}`],
			object: {
				...post,
				content: htmlContent,
				url: statusUrl,
				sensitive: false,
				atomUri: post.id,
				inReplyToAtomUri: null,
				conversation: conversationId,
				context: conversationId,
				attachment: [],
				tag: [],
				replies: {
					id: `${post.id}/replies`,
					type: ACTIVITY_TYPES.COLLECTION,
					totalItems: 0,
					first: `${post.id}/replies?page=true`
				}
			},
		};
	});

	return {
		"@context": ACTIVITYPUB_CONTEXT,
		id: `${outboxUrl}?page=true`,
		type: ACTIVITY_TYPES.ORDERED_COLLECTION_PAGE,
		totalItems: createActivities.length,
		prev: createActivities.length > 0 ? `${outboxUrl}?min_id=0&page=true` : undefined,
		partOf: outboxUrl,
		orderedItems: createActivities,
	};
});
