import {createDataStorage} from "~~/server/utils/fileStorage";
import type {ASActivity, ASNote, ASObject, ASCollection} from "~~/shared/types/activitypub";
import {ACTIVITY_TYPES, FILE_PATHS} from "~~/shared/constants";


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
	storage.write(inboxPath, body, {pretty: true});

	// Process Like activity
	if (body.type === ACTIVITY_TYPES.LIKE) {
		processLike(body, storage);
	}

	// Process Undo activity
	if (body.type === ACTIVITY_TYPES.UNDO) {
		processUndo(body, storage);
	}

	// Process Create activity (for replies)
	if (body.type === ACTIVITY_TYPES.CREATE) {
		processCreate(body, storage);
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

	if (!post.likes) {
		post.likes = {
			id: `${post.id}/likes`,
			type: ACTIVITY_TYPES.ORDERED_COLLECTION,
			totalItems: 0,
			orderedItems: [],
		};
	}

	const likesCollection = (post.likes as ASCollection<string>);
	const people = likesCollection.orderedItems || [];

	if (!people.includes(actorId)) {
		people.push(actorId);
		likesCollection.totalItems = people.length;
	}

	storage.write(postPath, post, {pretty: true});
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

	if (!post.likes) {
		return;
	}

	const likesCollection = post.likes as ASCollection<string>;
	let likes = likesCollection.orderedItems || [];
	likes = likes.filter((id) => id !== actorId);
	likesCollection.totalItems = likes.length;


storage.write(postPath, post, {pretty: true});
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
		const statusesIndex = parts.indexOf("statuses", usernameIndex) + 1;

		if (usernameIndex < 0 || statusesIndex < 0 || statusesIndex >= parts.length) {
			return null;
		}

		const username = parts[usernameIndex];
		const statusId = parts[statusesIndex];

		return `${FILE_PATHS.POSTS_DIR}/${username}/${statusId}.jsonld`;
	} catch (error) {
		console.error("Error parsing post URL:", error);
		return null;
	}
}

/**
 * Process incoming Create activity (for replies)
 * Validates the reply and adds the reply ID to parent post's replies collection
 */
function processCreate(activity: ASActivity, storage: ReturnType<typeof createDataStorage>): void {
	const objectData = activity.object;
	if (!objectData || typeof objectData === "string") {
		return;
	}

	const note = objectData as ASNote;

	// Validate it's a Note and has a valid inReplyTo
	if (note.type !== ACTIVITY_TYPES.NOTE || !note.inReplyTo) {
		return;
	}

	// Validate the reply has required fields
	if (!note.id || !note.content || !note.attributedTo) {
		return;
	}

	const parentPostPath = extractPostPath(note.inReplyTo);
	if (!parentPostPath) {
		return;
	}

	const parentPost = storage.read<ASNote>(parentPostPath);
	if (!parentPost.id) {
		return;
	}

	// Initialize replies collection if it doesn't exist
	if (!parentPost.replies) {
		parentPost.replies = {
			id: `${parentPost.id}/replies`,
			type: ACTIVITY_TYPES.ORDERED_COLLECTION,
			totalItems: 0,
			orderedItems: [],
		};
	}

	// Add reply ID to the collection (reply is stored on user's server)
	const repliesCollection = parentPost.replies as ASCollection<string>;
	const items = repliesCollection.orderedItems || repliesCollection.items || [];

	if (!items.includes(note.id)) {
		if (repliesCollection.orderedItems) {
			repliesCollection.orderedItems.push(note.id);
		} else if (repliesCollection.items) {
			repliesCollection.items.push(note.id);
		}
		repliesCollection.totalItems = items.length + 1;
	}

	storage.write(parentPostPath, parentPost, {pretty: true});
}


