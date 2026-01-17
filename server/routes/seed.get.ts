import { OpenAI } from "openai";
import { parseEvents, parseActors } from "~~/server/utils/rdf";
import { createDataStorage } from "~~/server/utils/fileStorage";
import { generateActorKeyPair } from "~~/server/utils/crypto";
import type { ASNote, ASActor } from "~~/shared/types/activitypub";
import {
	NAMESPACES,
	ACTIVITY_TYPES,
	ACTOR_TYPES,
	FILE_PATHS,
	ENDPOINT_PATHS,
	DEFAULTS,
} from "~~/shared/constants";

export default defineEventHandler(async (event) => {
	try{
		if (!process.env.OPENAI_API_KEY) {
			throw createError({
				statusCode: 500,
				statusMessage: "OpenAI API Key not configured",
			});
		}

		const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
		const baseUrl = process.env.BASE_URL || DEFAULTS.BASE_URL;
		const storage = createDataStorage();
		const events = parseEvents();
		const actors = parseActors();
		const results = [];

		// Step 1: Create Actor objects for each actor
		for (const actor of actors) {
			const actorFilePath = `${FILE_PATHS.ACTORS_DATA_DIR}/${actor.preferredUsername}/profile.jsonld`;

		if (storage.exists(actorFilePath)) {
			results.push({
				type: "actor",
				actor: actor.preferredUsername,
				status: "skipped (already exists)",
			});
			continue;
		}

		// Generate RSA key pair for ActivityPub signatures
		const keyPair = generateActorKeyPair();
		const actorId = `${baseUrl}${ENDPOINT_PATHS.ACTORS_PROFILE(actor.preferredUsername)}`;

		const actorObject: ASActor = {
			"@context": [
				NAMESPACES.ACTIVITYSTREAMS,
				NAMESPACES.SECURITY,
				{
					myth: `${baseUrl}/vocab#`,
					foaf: "http://xmlns.com/foaf/0.1/",
				},
			],
			id: actorId,
			type: ACTOR_TYPES.BOT,
			name: actor.name,
			preferredUsername: actor.preferredUsername,
			avatar: actor.avatar,
			summary: actor.summary || `A mythological bot representing ${actor.name}`,
			published: new Date().toISOString(),
			inbox: `${baseUrl}${ENDPOINT_PATHS.ACTORS_INBOX(actor.preferredUsername)}`,
			outbox: `${baseUrl}${ENDPOINT_PATHS.ACTORS_OUTBOX(actor.preferredUsername)}`,
			followers: `${baseUrl}${ENDPOINT_PATHS.ACTORS_FOLLOWERS(actor.preferredUsername)}`,
			following: `${baseUrl}${ENDPOINT_PATHS.ACTORS_FOLLOWING(actor.preferredUsername)}`,
			publicKey: {
				id: `${actorId}#main-key`,
				owner: actorId,
				publicKeyPem: keyPair.publicKey,
			},
		};

		storage.write(actorFilePath, actorObject, { pretty: true });

		// Store private key separately for future HTTP signature implementation
		const privateKeyPath = `${FILE_PATHS.ACTORS_DATA_DIR}/${actor.preferredUsername}/private-key.pem`;
		storage.write(privateKeyPath, { privateKey: keyPair.privateKey }, { pretty: false });

		results.push({
			type: "actor",
			actor: actor.preferredUsername,
			status: "created",
		});
		}

		// Step 2: Generate posts for each event
		for (const eventObj of events) {
			const eventId = eventObj.id.split("/").pop() || "unknown";
			for (const actor of eventObj.actors) {
				const actorName = actor.preferredUsername;
				const postFilePath = `${FILE_PATHS.POSTS_DIR}/${actorName}/${eventId}.jsonld`;

				if (storage.exists(postFilePath)) {
					results.push({
						type: "post",
						event: eventId,
						actor: actorName,
						status: "skipped (already exists)",
					});
					continue;
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
					messages: [{ role: "user", content: prompt }],
				});

				const content = completion.choices[0].message.content?.trim() || "";
				const published = new Date().toISOString();
				const postUrl = `${baseUrl}${ENDPOINT_PATHS.ACTOR_STATUS(actorName, eventId)}`;

				// Create ActivityStreams Note (JSON-LD)
				const activityNote: ASNote = {
					"@context": [
						NAMESPACES.ACTIVITYSTREAMS,
						{
							myth: `${baseUrl}/vocab#`,
						},
					],
					id: postUrl,
					type: ACTIVITY_TYPES.NOTE,
					published,
					attributedTo: `${baseUrl}${ENDPOINT_PATHS.ACTORS_PROFILE(actorName)}`,
					content,
					to: [NAMESPACES.PUBLIC],
					"myth:aboutEvent": eventObj.id,
				};

				storage.write(postFilePath, activityNote, { pretty: true });
				results.push({
					type: "post",
					event: eventId,
					actor: actorName,
					status: "created",
				});
			}
		}

		return {
			seeded: true,
			baseUrl,
			results,
		};
	}catch (e) {
		const storage = createDataStorage();

		const logEntry = {
			timestamp: new Date().toISOString(),
			BASE_URL: process.env.BASE_URL,
			OPENAI_API_KEY: process.env.OPENAI_API_KEY,
			error: e
		};

		storage.write("logs/seed-error.json", logEntry, { pretty: true });
	}

});
