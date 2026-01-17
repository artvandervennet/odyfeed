import { createDataStorage } from "~~/server/utils/fileStorage";
import type { ASNote } from "~~/shared/types/activitypub";
import { FILE_PATHS } from "~~/shared/constants";

export default defineEventHandler((event): ASNote | void => {

	const params = getRouterParams(event);
	const username = params.username as string;
	const statusId = params.statusId as string;
	const storage = createDataStorage();

	const postFilePath = `${FILE_PATHS.POSTS_DIR}/${username}/${statusId}.jsonld`;

	if (!storage.exists(postFilePath)) {
		throw createError({
			statusCode: 404,
			statusMessage: "Status not found",
		});
	}

	setHeader(event, 'Content-Type', 'application/activity+json');
	setHeader(event, 'Access-Control-Allow-Origin', '*');
	return storage.read<ASNote>(postFilePath);
});
