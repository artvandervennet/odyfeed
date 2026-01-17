import { createDataStorage } from "~~/server/utils/fileStorage";
import type { ASNote } from "~~/shared/types/activitypub";
import { FILE_PATHS, ENDPOINT_PATHS, DEFAULTS, ACTIVITY_TYPES } from "~~/shared/constants";

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

export default defineEventHandler((event): ASNote | void => {

	const params = getRouterParams(event);
	const username = params.username as string;
	const statusId = params.statusId as string;
	const storage = createDataStorage();
	const baseUrl = process.env.BASE_URL || DEFAULTS.BASE_URL;

	const postFilePath = `${FILE_PATHS.POSTS_DIR}/${username}/${statusId}.jsonld`;

	if (!storage.exists(postFilePath)) {
		throw createError({
			statusCode: 404,
			statusMessage: "Status not found",
		});
	}

	setHeader(event, 'Content-Type', 'application/activity+json');
	setHeader(event, 'Access-Control-Allow-Origin', '*');

	const post = storage.read<ASNote>(postFilePath);
	const statusUrl = `${baseUrl}${ENDPOINT_PATHS.ACTOR_STATUS(username, statusId)}`;
	const conversationId = `${baseUrl}/contexts/${username}-${statusId}`;

	return {
		...post,
		content: formatContentAsHtml(post.content),
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
	};
});
