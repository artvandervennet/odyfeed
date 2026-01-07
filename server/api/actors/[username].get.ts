import { createDataStorage } from "~~/server/utils/fileStorage";
import { parseActors } from "~~/server/utils/rdf";
import type { ASActor } from "~~/shared/types/activitypub";
import { FILE_PATHS, ENDPOINT_PATHS, DEFAULTS, ACTOR_TYPES, NAMESPACES } from "~~/shared/constants";

export default defineEventHandler((event): ASActor | null => {
	const params = getRouterParams(event);
	const username = params.username as string;
	const storage = createDataStorage();
	const baseUrl = useRuntimeConfig().public.baseUrl || DEFAULTS.BASE_URL;

	const actorFilePath = `${FILE_PATHS.ACTORS_DATA_DIR}/${username}/profile.jsonld`;

	if (!storage.exists(actorFilePath)) {
		throw createError({
			statusCode: 404,
			statusMessage: "Actor not found",
		});
	}

	return storage.read<ASActor>(actorFilePath);
});
