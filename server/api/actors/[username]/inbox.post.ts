import { createDataStorage } from "~~/server/utils/fileStorage";
import type { ASActivity, ASNote, ASObject } from "~~/shared/types/activitypub";
import { ACTIVITY_TYPES, FILE_PATHS } from "~~/shared/constants";

interface LikesCollection {
	id: string;
	type: "Collection" | "OrderedCollection";
	totalItems: number;
	items: string[];
}

export default defineEventHandler(async (event) => {
	const params = getRouterParams(event);
	const username = params.username as string;
	const body = await readBody<ASActivity>(event);
	const storage = createDataStorage();

	if (!body || !body.type) {
		throw createError({
			statusCode: 400,
			statusMessage: "Invalid activity",
		});
	}

	// Store raw activity in inbox
	const inboxPath = `${FILE_PATHS.ACTORS_DATA_DIR}/${username}/inbox/${Date.now()}-${body.type.toLowerCase()}.jsonld`;
	storage.write(inboxPath, body, { pretty: true });

	// Process Like activity
	if (body.type === ACTIVITY_TYPES.LIKE) {
		processLike(body, storage);
	}

	// Process Undo activity
	if (body.type === ACTIVITY_TYPES.UNDO) {
		processUndo(body, storage);
	}

	return setResponseStatus(event, 202);
});

/**
 * Process incoming Like activity
 * Adds the actor to the post's likes collection
 */
function processLike(activity: ASActivity, storage: ReturnType<typeof createDataStorage>): void {
	const targetId = typeof activity.object === "string"
		? activity.object
		: (activity.object as ASObject).id;

	if (!targetId) {
		return;
	}

	const postPath = extractPostPath(targetId);
	if (!postPath) {
		return;
	}

	const post = storage.read<ASNote>(postPath);
	if (!post.id) {
		return;
	}

	const actorId = activity.actor;
	if (!actorId) {
		return;
	}

	// Initialize likes collection if it doesn't exist
	if (!post.likes) {
		post.likes = {
			id: `${post.id}/likes`,
			type: ACTIVITY_TYPES.COLLECTION,
			totalItems: 0,
			items: [],
		} as LikesCollection;
	}

	// Support both array and Collection object
	if (Array.isArray(post.likes)) {
		if (!post.likes.includes(actorId)) {
			post.likes.push(actorId);
		}
	} else if ((post.likes as LikesCollection).items) {
		const likesCollection = post.likes as LikesCollection;
		if (!likesCollection.items.includes(actorId)) {
			likesCollection.items.push(actorId);
			likesCollection.totalItems = likesCollection.items.length;
		}
	}

	storage.write(postPath, post, { pretty: true });
}

/**
 * Process incoming Undo activity
 * Removes the actor from the post's likes collection
 */
function processUndo(activity: ASActivity, storage: ReturnType<typeof createDataStorage>): void {
	const objectToUndo = activity.object;
	if (!objectToUndo || typeof objectToUndo !== "object") {
		return;
	}

	const activityToUndo = objectToUndo as ASActivity;
	if (activityToUndo.type !== ACTIVITY_TYPES.LIKE) {
		return;
	}

	const targetId = typeof activityToUndo.object === "string"
		? activityToUndo.object
		: (activityToUndo.object as ASObject).id;

	if (!targetId) {
		return;
	}

	const postPath = extractPostPath(targetId);
	if (!postPath) {
		return;
	}

	const post = storage.read<ASNote>(postPath);
	if (!post.id) {
		return;
	}

	const actorId = activity.actor;
	if (!actorId) {
		return;
	}

	// Remove actor from likes
	if (Array.isArray(post.likes)) {
		post.likes = post.likes.filter((id: string) => id !== actorId);
	} else if ((post.likes as LikesCollection).items) {
		const likesCollection = post.likes as LikesCollection;
		likesCollection.items = likesCollection.items.filter((id) => id !== actorId);
		likesCollection.totalItems = likesCollection.items.length;
	}

	storage.write(postPath, post, { pretty: true });
}

/**
 * Extract post file path from ActivityPub status URL
 * Example: https://domain.com/api/actors/odysseus/statuses/01-trojan-horse
 * Returns: posts/odysseus/01-trojan-horse.jsonld
 */
function extractPostPath(targetUrl: string): string | null {
	try {
		const url = new URL(targetUrl);
		const parts = url.pathname.split("/").filter(Boolean);

		// Expected structure: /api/actors/{username}/statuses/{statusId}
		const apiIndex = parts.indexOf("api");
		if (apiIndex === -1) {
			return null;
		}

		const usernameIndex = parts.indexOf("actors", apiIndex) + 1;
		const statusesIndex = parts.indexOf("statuses", usernameIndex);

		if (usernameIndex < 0 || statusesIndex < 0 || statusesIndex + 1 >= parts.length) {
			return null;
		}

		const username = parts[usernameIndex];
		const statusId = parts[statusesIndex + 1];

		return `${FILE_PATHS.POSTS_DIR}/${username}/${statusId}.jsonld`;
	} catch (error) {
		console.error("Error parsing post URL:", error);
		return null;
	}
}

