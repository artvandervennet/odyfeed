import { readFileSync } from "fs";
import { resolve } from "path";
import { Parser } from "n3";
import type { MythActor, MythEvent } from "~~/shared/types/activitypub";
import { FILE_PATHS, ENDPOINT_PATHS, DEFAULTS } from "~~/shared/constants";

export type { MythActor as Actor, MythEvent as Event };

function getBaseUrl() {
	return process.env.ODYSSEY_BASE_URL || DEFAULTS.BASE_URL;
}

function parseTurtleFile(filename: string): Map<string, Map<string, any>> {
	const path = resolve(process.cwd(), "public", filename);
	const fileContent = readFileSync(path, "utf-8");
	const parser = new Parser();
	const quads = parser.parse(fileContent);
	const resources = new Map<string, Map<string, any>>();

	for (const quad of quads) {
		const subject = quad.subject.value;
		if (!resources.has(subject)) {
			resources.set(subject, new Map());
		}
		const resource = resources.get(subject)!;
		const predicateKey = quad.predicate.value.split("#").pop() || quad.predicate.value;
		const objectValue = quad.object.termType === "Literal"
			? quad.object.value
			: quad.object.value;

		if (resource.has(predicateKey)) {
			const existing = resource.get(predicateKey);
			if (Array.isArray(existing)) {
				existing.push(objectValue);
			} else {
				resource.set(predicateKey, [existing, objectValue]);
			}
		} else {
			resource.set(predicateKey, objectValue);
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
