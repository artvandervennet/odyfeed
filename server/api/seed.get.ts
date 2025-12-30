import {OpenAI} from "openai";
import {parseEvents} from "~~/server/utils/rdf";
import {existsSync, mkdirSync, writeFileSync} from "fs";
import {resolve} from "path";
import type { ASNote } from "~~/shared/types/activitypub";
import { NAMESPACES, ACTIVITY_TYPES, DATA_PATHS, DEFAULTS } from "~~/shared/constants";

export default defineEventHandler(async (event) => {
	const config = useRuntimeConfig();
	if (!config.openaiApiKey) {
		throw createError({
			statusCode: 500,
			statusMessage: "OpenAI API Key not configured",
		});
	}

	const openai = new OpenAI({apiKey: config.openaiApiKey});
	const events = parseEvents();
	const results = [];

	for (const eventObj of events) {
		const eventId = eventObj.id.split('/').pop();
		for (const actor of eventObj.actors) {
			const actorName = actor.preferredUsername;
			const postDir = resolve(process.cwd(), `${DATA_PATHS.POSTS}/${actorName}`);
			const postId = `${eventId}`;
			const jsonPath = resolve(postDir, `${postId}.jsonld`);

			// Idempotentie check
			if (existsSync(jsonPath)) {
				results.push({event: eventId, actor: actorName, status: "skipped (already exists)"});
				continue;
			}

			if (!existsSync(postDir)) {
				mkdirSync(postDir, {recursive: true});
			}

			// Generate content via ChatGPT
			const prompt = `
        Schrijf een korte, sociale media post (ActivityPub stijl) vanuit het perspectief van de Griekse mythologische figuur ${actor.name}.
        Het event is: "${eventObj.title}".
        Beschrijving van het event: "${eventObj.description}".
        De toon van ${actor.name} is: "${actor.tone}".
        Houd het kort en krachtig. Gebruik niet te veel emoji's. Deze post moet lijken alsof het een twitter bericht is van ${actor.name} moest die echt zijn.
      `;

			const completion = await openai.chat.completions.create({
				model: "gpt-4o-mini",
				messages: [{role: "user", content: prompt}],
			});

			const content = completion.choices[0].message.content?.trim() || "";
			const published = new Date().toISOString();
			const baseUrl = config.public.baseUrl || DEFAULTS.BASE_URL;
			const postUrl = `${baseUrl}/actors/${actorName}/statuses/${postId}`;

			// 1. Opslaan als ActivityStreams Note (JSON-LD)
			const activityNote: ASNote = {
				"@context": [
					NAMESPACES.ACTIVITYSTREAMS,
					{
						"myth": `${baseUrl}/vocab#`
					}
				],
				"id": postUrl,
				"type": ACTIVITY_TYPES.NOTE,
				"published": published,
				"attributedTo": actor.id,
				"content": content,
				"to": [NAMESPACES.PUBLIC],
				"myth:aboutEvent": eventObj.id,
			};

			writeFileSync(jsonPath, JSON.stringify(activityNote, null, 2));

		}
	}

	return {seeded: true, results};
});
