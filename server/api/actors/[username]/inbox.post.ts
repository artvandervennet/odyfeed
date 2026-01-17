import {createDataStorage} from "~~/server/utils/fileStorage";
import type {ASActivity, ASNote, ASObject, ASCollection} from "~~/shared/types/activitypub";
import {ACTIVITY_TYPES, FILE_PATHS} from "~~/shared/constants";
import {logInfo, logError, logDebug} from "~~/server/utils/logger";


export default defineEventHandler(async (event) => {
	const params = getRouterParams(event);
	const username = params.username as string;
	const storage = createDataStorage();

	const actorFilePath = `${FILE_PATHS.ACTORS_DATA_DIR}/${username}/profile.jsonld`;
	if (!storage.exists(actorFilePath)) {
		logError(`Actor not found: ${username}`);
		throw createError({
			statusCode: 404,
			statusMessage: "Actor not found",
		});
	}

	const contentType = getHeader(event, 'content-type') || '';
	if (!contentType.includes('application/activity+json') &&
	    !contentType.includes('application/ld+json')) {
		logError(`Invalid Content-Type for ${username}: ${contentType}`);
		throw createError({
			statusCode: 400,
			statusMessage: 'Content-Type must be application/activity+json or application/ld+json'
		});
	}

	const body = await readBody<ASActivity>(event);

	if (!body || !body.type || !body.actor) {
		logError(`Invalid activity format for ${username}`, { body });
		throw createError({
			statusCode: 400,
			statusMessage: "Invalid activity format. Required fields: type, actor",
		});
	}

	logInfo(`Received ${body.type} activity for ${username} from ${body.actor}`);

	const inboxPath = `${FILE_PATHS.ACTORS_DATA_DIR}/${username}/inbox/${Date.now()}-${body.type.toLowerCase()}.jsonld`;
	storage.write(inboxPath, body, {pretty: true});

	if (body.type === ACTIVITY_TYPES.LIKE) {
		processLike(body, storage);
		setHeader(event, 'Content-Type', 'application/activity+json; charset=utf-8');
		setResponseStatus(event, 202);
		return { status: 'accepted', message: 'Like activity processed' };
	}

	if (body.type === ACTIVITY_TYPES.UNDO) {
		processUndo(body, storage);
		setHeader(event, 'Content-Type', 'application/activity+json; charset=utf-8');
		setResponseStatus(event, 202);
		return { status: 'accepted', message: 'Undo activity processed' };
	}

	if (body.type === ACTIVITY_TYPES.CREATE) {
		processCreate(body, storage);
		setHeader(event, 'Content-Type', 'application/activity+json; charset=utf-8');
		setResponseStatus(event, 202);
		return { status: 'accepted', message: 'Create activity processed' };
	}

	if (body.type === ACTIVITY_TYPES.FOLLOW) {
		await processFollow(body, username, storage);
		setHeader(event, 'Content-Type', 'application/activity+json; charset=utf-8');
		setResponseStatus(event, 202);
		return { status: 'accepted', message: 'Follow request accepted' };
	}

	logInfo(`Received ${body.type} activity - no specific handler`);
	setHeader(event, 'Content-Type', 'application/activity+json; charset=utf-8');
	setResponseStatus(event, 202);
	return { status: 'accepted', message: `${body.type} activity received` };
});

function processLike(activity: ASActivity, storage: ReturnType<typeof createDataStorage>): void {
	const targetId = typeof activity.object === "string"
		? activity.object
		: (activity.object as ASObject).id;

	if (!targetId) {
		logError('Like activity missing target ID');
		return;
	}

	const postPath = extractPostPath(targetId);
	if (!postPath) {
		logError('Could not extract post path from target', { targetId });
		return;
	}

	const post = storage.read<ASNote>(postPath);
	if (!post.id) {
		logError('Post not found or invalid', { postPath });
		return;
	}

	const actorId = activity.actor;
	if (!actorId) {
		logError('Like activity missing actor ID');
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
		logInfo('Added like to post', { postPath, actorId, totalLikes: people.length });
	} else {
		logDebug('Actor already liked this post', { postPath, actorId });
	}

	storage.write(postPath, post, {pretty: true});
}

function processUndo(activity: ASActivity, storage: ReturnType<typeof createDataStorage>): void {
	const objectToUndo = activity.object;
	if (!objectToUndo || typeof objectToUndo !== "object") {
		logError('Undo activity missing object or invalid format');
		return;
	}

	const activityToUndo = objectToUndo as ASActivity;
	if (activityToUndo.type !== ACTIVITY_TYPES.LIKE) {
		logDebug('Undo activity for non-Like type', { type: activityToUndo.type });
		return;
	}

	const targetId = typeof activityToUndo.object === "string"
		? activityToUndo.object
		: (activityToUndo.object as ASObject).id;

	if (!targetId) {
		logError('Undo Like activity missing target ID');
		return;
	}

	const postPath = extractPostPath(targetId);
	if (!postPath) {
		logError('Could not extract post path from target', { targetId });
		return;
	}

	const post = storage.read<ASNote>(postPath);
	if (!post.id) {
		logError('Post not found or invalid', { postPath });
		return;
	}

	const actorId = activity.actor;
	if (!actorId) {
		logError('Undo activity missing actor ID');
		return;
	}

	if (!post.likes) {
		logDebug('Post has no likes to undo', { postPath });
		return;
	}

	const likesCollection = post.likes as ASCollection<string>;
	let likes = likesCollection.orderedItems || [];
	const originalCount = likes.length;
	likes = likes.filter((id) => id !== actorId);
	likesCollection.totalItems = likes.length;

	if (originalCount > likes.length) {
		logInfo('Removed like from post', { postPath, actorId, totalLikes: likes.length });
	} else {
		logDebug('No like to remove from post', { postPath, actorId });
	}

	storage.write(postPath, post, {pretty: true});
}

function extractPostPath(targetUrl: string): string | null {
	try {
		const url = new URL(targetUrl);
		const parts = url.pathname.split("/").filter(Boolean);

		const apiIndex = parts.indexOf("api");
		if (apiIndex === -1) {
			logDebug('No "api" segment in URL path', { targetUrl });
			return null;
		}

		const usernameIndex = parts.indexOf("actors", apiIndex) + 1;
		let statusesIndex = parts.indexOf("status", usernameIndex) + 1;

		if (statusesIndex === 0) {
			statusesIndex = parts.indexOf("statuses", usernameIndex) + 1;
		}

		if (usernameIndex < 0 || statusesIndex < 0 || statusesIndex >= parts.length) {
			logDebug('Invalid URL structure for post', { targetUrl, usernameIndex, statusesIndex });
			return null;
		}

		const username = parts[usernameIndex];
		const statusId = parts[statusesIndex];

		return `${FILE_PATHS.POSTS_DIR}/${username}/${statusId}.jsonld`;
	} catch (error) {
		logError("Error parsing post URL", { targetUrl, error });
		return null;
	}
}

function processCreate(activity: ASActivity, storage: ReturnType<typeof createDataStorage>): void {
	const objectData = activity.object;
	if (!objectData || typeof objectData === "string") {
		logDebug('Create activity has no object or object is a string');
		return;
	}

	const note = objectData as ASNote;

	if (note.type !== ACTIVITY_TYPES.NOTE || !note.inReplyTo) {
		logDebug('Create activity object is not a Note or has no inReplyTo', { type: note.type, hasInReplyTo: !!note.inReplyTo });
		return;
	}

	if (!note.id || !note.content || !note.attributedTo) {
		logError('Reply missing required fields', { hasId: !!note.id, hasContent: !!note.content, hasAttributedTo: !!note.attributedTo });
		return;
	}

	const parentPostPath = extractPostPath(note.inReplyTo);
	if (!parentPostPath) {
		logError('Could not extract parent post path', { inReplyTo: note.inReplyTo });
		return;
	}

	const parentPost = storage.read<ASNote>(parentPostPath);
	if (!parentPost.id) {
		logError('Parent post not found', { parentPostPath });
		return;
	}

	if (!parentPost.replies) {
		parentPost.replies = {
			id: `${parentPost.id}/replies`,
			type: ACTIVITY_TYPES.ORDERED_COLLECTION,
			totalItems: 0,
			orderedItems: [],
		};
	}

	const repliesCollection = parentPost.replies as ASCollection<string>;
	const items = repliesCollection.orderedItems || repliesCollection.items || [];

	if (!items.includes(note.id)) {
		if (repliesCollection.orderedItems) {
			repliesCollection.orderedItems.push(note.id);
		} else if (repliesCollection.items) {
			repliesCollection.items.push(note.id);
		}
		repliesCollection.totalItems = items.length + 1;
		logInfo('Added reply to post', { parentPostPath, replyId: note.id, totalReplies: repliesCollection.totalItems });
	} else {
		logDebug('Reply already exists in collection', { parentPostPath, replyId: note.id });
	}

	storage.write(parentPostPath, parentPost, {pretty: true});
}

async function processFollow(activity: ASActivity, username: string, storage: ReturnType<typeof createDataStorage>): Promise<void> {
	const followerId = activity.actor;
	if (!followerId) {
		logError('Follow activity missing actor ID');
		return;
	}

	logInfo(`Processing follow request from ${followerId} for ${username}`);

	const followersPath = `${FILE_PATHS.ACTORS_DATA_DIR}/${username}/followers.json`;
	const followersData = storage.read<{ followers: string[] }>(followersPath);

	if (!followersData.followers) {
		followersData.followers = [];
	}

	if (!followersData.followers.includes(followerId)) {
		followersData.followers.push(followerId);
		storage.write(followersPath, followersData, {pretty: true});
		logInfo(`Added ${followerId} to followers list`, { totalFollowers: followersData.followers.length });
	} else {
		logDebug(`${followerId} already in followers list`);
	}

	await sendAcceptActivity(activity, username, storage);
}

async function sendAcceptActivity(followActivity: ASActivity, username: string, storage: ReturnType<typeof createDataStorage>): Promise<void> {
	try {
		const baseUrl = process.env.BASE_URL || "http://localhost:3000";
		const actorId = `${baseUrl}/api/actors/${username}`;

		logInfo(`Processing Accept for follow from: ${followActivity.actor}`);

		const followerResponse = await fetch(followActivity.actor, {
			headers: {
				'Accept': 'application/activity+json, application/ld+json',
				'User-Agent': 'OdyFeed/1.0 (ActivityPub)',
			},
		});

		if (!followerResponse.ok) {
			logError(`Failed to fetch follower actor: ${followActivity.actor}`, { status: followerResponse.status, statusText: followerResponse.statusText });
			return;
		}

		const followerActor = await followerResponse.json();
		const followerInbox = followerActor.inbox;

		if (!followerInbox) {
			logError(`No inbox found for follower: ${followActivity.actor}`);
			return;
		}

		logInfo(`Follower inbox: ${followerInbox}`);

		const acceptActivity = {
			"@context": "https://www.w3.org/ns/activitystreams",
			type: ACTIVITY_TYPES.ACCEPT,
			id: `${actorId}/accepts/${Date.now()}`,
			actor: actorId,
			object: followActivity,
		};

		const privateKeyPath = `${FILE_PATHS.ACTORS_DATA_DIR}/${username}/private-key.pem`;
		const privateKeyData = storage.read<{ privateKey?: string }>(privateKeyPath);

		let privateKeyPem: string;
		if (privateKeyData.privateKey) {
			privateKeyPem = privateKeyData.privateKey;
		} else {
			logError(`No private key found for actor: ${username}`, { privateKeyPath });
			return;
		}

		const { signRequest } = await import('~~/server/utils/crypto');
		const body = JSON.stringify(acceptActivity);
		const signatureHeaders = signRequest({
			privateKey: privateKeyPem,
			keyId: `${actorId}#main-key`,
			url: followerInbox,
			method: 'POST',
			body,
		});

		logDebug(`Sending Accept activity to ${followerInbox}`, { headers: Object.keys(signatureHeaders) });

		const response = await fetch(followerInbox, {
			method: 'POST',
			headers: {
				...signatureHeaders,
				'Content-Type': 'application/activity+json',
				'Accept': 'application/activity+json',
				'User-Agent': 'OdyFeed/1.0 (ActivityPub)',
			},
			body,
		});

		if (!response.ok) {
			const errorText = await response.text().catch(() => 'Unable to read error');
			logError(`Failed to send Accept activity to ${followerInbox}`, {
				status: response.status,
				statusText: response.statusText,
				errorText
			});
		} else {
			logInfo(`Successfully sent Accept activity to ${followerInbox}`);
		}
	} catch (error) {
		logError('Error sending Accept activity', error);
	}
}





