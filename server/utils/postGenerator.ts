import { OpenAI } from "openai";
import type { MythActor, MythEvent, ASNote } from "~~/shared/types/activitypub";
import { NAMESPACES, ACTIVITY_TYPES, ENDPOINT_PATHS, DEFAULTS } from "~~/shared/constants";
import { logInfo, logError } from "./logger";

interface PostGenerationResult {
	eventId: string;
	status: "created" | "skipped" | "error";
	note?: ASNote;
	error?: string;
}

export const generatePostsForActor = async function (
	actor: MythActor,
	events: MythEvent[],
	existingPostCheck?: (eventId: string) => boolean
): Promise<PostGenerationResult[]> {
	if (!process.env.OPENAI_API_KEY) {
		throw new Error("OpenAI API Key not configured");
	}

	const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
	const baseUrl = process.env.BASE_URL || DEFAULTS.BASE_URL;
	const results: PostGenerationResult[] = [];

	const relevantEvents = events.filter((event) =>
		event.actors.some((a) => a.preferredUsername === actor.preferredUsername)
	);

	for (const eventObj of relevantEvents) {
		const eventId = eventObj.id.split("/").pop() || "unknown";

		if (existingPostCheck && existingPostCheck(eventId)) {
			results.push({
				eventId,
				status: "skipped",
			});
			continue;
		}

		try {
			const prompt = `
Schrijf een korte, sociale media post (ActivityPub stijl) vanuit het perspectief van de Griekse mythologische figuur ${actor.name}.
Het event is: "${eventObj.title}".
Beschrijving van het event: "${eventObj.description}".
De toon van ${actor.name} is: "${actor.tone}".
Houd het kort en krachtig. Gebruik niet te veel emoji's. Deze post moet lijken alsof het een twitter bericht is van ${actor.name} moest die echt zijn.
			`.trim();

			const completion = await openai.chat.completions.create({
				model: "gpt-4o-mini",
				messages: [{ role: "user", content: prompt }],
			});

		const content = completion.choices[0].message.content?.trim() || "";
		const published = new Date().toISOString();
		const timestamp = Date.now();
		const uniqueStatusId = `${eventId}-${actor.preferredUsername}-${timestamp}`;
		const postUrl = `${baseUrl}${ENDPOINT_PATHS.STATUS(uniqueStatusId)}`;

		const activityNote: ASNote = {
			"@context": NAMESPACES.ACTIVITYSTREAMS,
			id: postUrl,
			type: ACTIVITY_TYPES.NOTE,
			published,
			attributedTo: `${baseUrl}${ENDPOINT_PATHS.ACTORS_PROFILE(actor.preferredUsername)}`,
			content,
			to: [NAMESPACES.PUBLIC],
			"myth:aboutEvent": eventObj.id,
		};

			results.push({
				eventId,
				status: "created",
				note: activityNote,
			});

			logInfo(`Generated post for ${actor.preferredUsername}: ${eventId}`);
		} catch (error) {
			logError(`Failed to generate post for ${actor.preferredUsername}: ${eventId}`, error);
			results.push({
				eventId,
				status: "error",
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}
	}

	return results;
};

export const generatePostActivity = function (
	note: ASNote,
	actorId: string
): any {
	return {
		"@context": NAMESPACES.ACTIVITYSTREAMS,
		id: `${note.id}/activity`,
		type: ACTIVITY_TYPES.CREATE,
		actor: actorId,
		published: note.published,
		to: note.to,
		object: note,
	};
};
