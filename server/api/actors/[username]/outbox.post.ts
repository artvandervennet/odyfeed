import { createDataStorage } from "~~/server/utils/fileStorage";
import type { ASActivity, ASNote } from "~~/shared/types/activitypub";
import { ACTIVITY_TYPES, FILE_PATHS } from "~~/shared/constants";

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

	const actorFilePath = `${FILE_PATHS.ACTORS_DATA_DIR}/${username}/profile.jsonld`;
	if (!storage.exists(actorFilePath)) {
		throw createError({
			statusCode: 404,
			statusMessage: "Actor not found",
		});
	}

	const timestamp = Date.now();
	const outboxPath = `${FILE_PATHS.ACTORS_DATA_DIR}/${username}/outbox/${timestamp}-${body.type.toLowerCase()}.jsonld`;
	storage.write(outboxPath, body, { pretty: true });

	if (body.type === ACTIVITY_TYPES.CREATE && body.object) {
		const note = (typeof body.object === 'string' ? null : body.object) as ASNote | null;
		if (note && note.type === ACTIVITY_TYPES.NOTE) {
			const noteId = note.id?.split('/').pop() || `${timestamp}-note`;
			const postPath = `${FILE_PATHS.POSTS_DIR}/${username}/${noteId}.jsonld`;
			storage.write(postPath, note, { pretty: true });
		}
	}

	setResponseStatus(event, 201);
	setResponseHeader(event, 'Location', body.id || `${event.node.req.url}/${timestamp}`);

	return {
		"@context": "https://www.w3.org/ns/activitystreams",
		message: "Activity posted to outbox",
		id: body.id,
	};
});
