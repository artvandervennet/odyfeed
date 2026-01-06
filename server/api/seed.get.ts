import {OpenAI} from "openai";
import {parseEvents, parseActors} from "~~/server/utils/rdf";
import { createPost, postExists } from "~~/server/utils/firestore";
import type { ASNote } from "~~/shared/types/activitypub";
import { NAMESPACES, ACTIVITY_TYPES, DEFAULTS } from "~~/shared/constants";

export default defineEventHandler(async (event) => {
	const config = useRuntimeConfig();
	if (!config.openaiApiKey) {
		throw createError({
			statusCode: 500,
			statusMessage: "OpenAI API Key not configured",
		});
	}

	const openai = new OpenAI({apiKey: config.openaiApiKey});
	const events = await parseEvents();
	const results = [];

	for (const eventObj of events) {
		const eventId = eventObj.id.split('/').pop();
		for (const actor of eventObj.actors) {
			const actorName = actor.preferredUsername;
			const postId = `${eventId}`;

			const exists = await postExists(postId, actorName);
			if (exists) {
				results.push({event: eventId, actor: actorName, status: "skipped (already exists)"});
				continue;
			}

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

			try {
				const docId = await createPost({
					...activityNote,
					postId: postId,
					attributedTo: actorName,
					likes: []
				});
				results.push({event: eventId, actor: actorName, status: "created", docId});
			} catch (error) {
				results.push({event: eventId, actor: actorName, status: "error", error: (error as Error).message});
			}
		}
	}

	return {seeded: true, results};
});
