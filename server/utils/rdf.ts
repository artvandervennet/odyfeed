import { readFileSync } from "fs";
import { resolve } from "path";
import { Parser } from "n3";
import type { MythActor, MythEvent } from "~~/shared/types/activitypub";
import { FILE_PATHS, ENDPOINT_PATHS, DEFAULTS } from "~~/shared/constants";

export type { MythActor as Actor, MythEvent as Event };

function getBaseUrl() {
	return process.env.BASE_URL || DEFAULTS.BASE_URL;
}

function parseTurtleFile(filename: string): Map<string, Map<string, string | string[]>> {
	const filePath = resolve(process.cwd(), "public", filename);
	const content = readFileSync(filePath, "utf-8");
	const parser = new Parser();
	const quads = parser.parse(content);

	const resources = new Map<string, Map<string, string | string[]>>();

	for (const quad of quads) {
		const subject = quad.subject.value;
		const predicateUri = quad.predicate.value;
		const predicate = predicateUri.includes("#")
			? predicateUri.split("#").pop()
			: predicateUri.split("/").pop();
		const object = quad.object.value;

		if (!resources.has(subject)) {
			resources.set(subject, new Map());
		}

		const predicateMap = resources.get(subject)!;
		const existingValue = predicateMap.get(predicate!);

		if (existingValue) {
			if (Array.isArray(existingValue)) {
				existingValue.push(object);
			} else {
				predicateMap.set(predicate!, [existingValue, object]);
			}
		} else {
			predicateMap.set(predicate!, object);
		}
	}

	return resources;
}

export function parseActors(): MythActor[] {
	const resources = parseTurtleFile(FILE_PATHS.ACTORS);
	const baseUrl = getBaseUrl();
	const actors: MythActor[] = [];

	for (const [subject, predicates] of resources.entries()) {
		const username = subject.split("/").pop() || subject;

		const name = predicates.get("name") as string;
		const tone = predicates.get("tone") as string;
		const avatar = predicates.get("avatar") as string;


		actors.push({
			id: `${baseUrl}${ENDPOINT_PATHS.ACTORS_PROFILE(username)}`,
			preferredUsername: username,
			name,
			summary: "",
			tone,
			avatar: avatar || "",
			inbox: `${baseUrl}${ENDPOINT_PATHS.ACTORS_INBOX(username)}`,
			outbox: `${baseUrl}${ENDPOINT_PATHS.ACTORS_OUTBOX(username)}`,
		} as MythActor);
	}

	return actors;
}

export function parseEvents(): MythEvent[] {
	const eventResources = parseTurtleFile(FILE_PATHS.EVENTS);
	const baseUrl = getBaseUrl();
	const actors = parseActors();
	const events: MythEvent[] = [];

	for (const [subject, predicates] of eventResources.entries()) {
		const eventId = subject.split("/").pop() || subject;
		const title = predicates.get("title") as string;
		const description = predicates.get("description") as string;
		const sequence = parseInt(predicates.get("sequence") as string, 10);
		const involvedActorRefs = predicates.get("involvesActor");

		const involvedActors = Array.isArray(involvedActorRefs)
			? involvedActorRefs
			: involvedActorRefs ? [involvedActorRefs] : [];

		const eventActors = involvedActors
			.map((actorRef: string) => {
				const username = actorRef.split("/").pop();
				return actors.find(a => a.preferredUsername === username);
			})
			.filter((a): a is MythActor => !!a);

		events.push({
			id: `${baseUrl}/events/${eventId}`,
			title,
			description,
			sequence,
			published: new Date().toISOString(),
			actors: eventActors,
		} as MythEvent);
	}

	return events.sort((a, b) => a.sequence - b.sequence);
}
