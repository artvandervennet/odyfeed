import { createDataStorage } from "~~/server/utils/fileStorage";
import { parseActors } from "~~/server/utils/rdf";
import type { ASCollection, EnrichedPost } from "~~/shared/types/activitypub";
import { NAMESPACES, ACTIVITY_TYPES, FILE_PATHS } from "~~/shared/constants";

export default defineEventHandler((event): ASCollection<EnrichedPost> => {

	console.log("ODYSSEY_BASE_URL: ", process.env.ODYSSEY_BASE_URL)
	console.log("OPENAI_API_KEY: ", process.env.OPENAI_API_KEY)


	const storage = createDataStorage();

	const logEntry = {
		timestamp: new Date().toISOString(),
		ODYSSEY_BASE_URL: process.env.ODYSSEY_BASE_URL,
		OPENAI_API_KEY: process.env.OPENAI_API_KEY,
	};

	storage.write("logs/env-vars.json", logEntry, { pretty: true });

	const allPosts: EnrichedPost[] = [];
	const actors = parseActors();

	const postDirs = storage.listFiles(FILE_PATHS.POSTS_DIR);

	for (const actorDir of postDirs) {
		const files = storage.listFiles(`${FILE_PATHS.POSTS_DIR}/${actorDir}`, ".jsonld");
		const actor = actors.find((a) => a.preferredUsername === actorDir);

		for (const file of files) {
			try {
				const content = storage.read<EnrichedPost>(
					`${FILE_PATHS.POSTS_DIR}/${actorDir}/${file}`
				);

				if (actor) {
					content.actor = actor;
				}

				allPosts.push(content);
			} catch (e) {
				console.error(
					`Error parsing post file ${file} in ${actorDir}:`,
					e
				);
			}
		}
	}

	allPosts.sort((a, b) => {
		const dateA = a.published ? new Date(a.published).getTime() : 0;
		const dateB = b.published ? new Date(b.published).getTime() : 0;
		return dateB - dateA;
	});

	return {
		"@context": NAMESPACES.ACTIVITYSTREAMS,
		id: "https://odyfeed.artvandervennet.ikdoeict.be/api/timeline",
		type: ACTIVITY_TYPES.ORDERED_COLLECTION,
		totalItems: allPosts.length,
		orderedItems: allPosts,
	};
});
