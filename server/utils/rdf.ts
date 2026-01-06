import { readFileSync } from "fs";
import { resolve } from "path";
import type { MythActor, MythEvent } from "~~/shared/types/activitypub";
import { DATA_PATHS, DEFAULTS } from "~~/shared/constants";
import { getAllActors as firestoreGetAllActors, getAllEvents as firestoreGetAllEvents } from "./firestore";

export type { MythActor as Actor, MythEvent as Event };

function getBaseUrl() {
	const config = useRuntimeConfig();
	return config.public.baseUrl || DEFAULTS.BASE_URL;
}

async function parseActorsFromFile(): Promise<MythActor[]> {
	const path = resolve(process.cwd(), DATA_PATHS.ACTORS);
	const raw = readFileSync(path, "utf-8");
	const baseUrl = getBaseUrl();
	
	const jsonld = JSON.parse(raw.replace(/\.\//g, `${baseUrl}/`));
	const actorsData = jsonld["@graph"] || [jsonld];

	return actorsData.map((a: any) => {
		const username = a["@id"].split('/').pop();
		return {
			id: `${baseUrl}/api/actors/${username}`,
			preferredUsername: username,
			name: a["foaf:name"],
			summary: a["as:summary"] || "",
			tone: a["myth:tone"],
			avatar: a["myth:avatar"] || "",
			inbox: `${baseUrl}/api/actors/${username}/inbox`,
			outbox: `${baseUrl}/api/actors/${username}/outbox`
		} as MythActor;
	});
}

async function parseEventsFromFile(): Promise<MythEvent[]> {
	const path = resolve(process.cwd(), DATA_PATHS.EVENTS);
	const raw = readFileSync(path, "utf-8");
	const baseUrl = getBaseUrl();
	const actors = await parseActors();

	const jsonld = JSON.parse(raw.replace(/\.\//g, `${baseUrl}/`));
	const eventsData = jsonld["@graph"] || [jsonld];

	return eventsData.map((event: any) => {
		const eventId = event["@id"].split('/').pop();
		const involvedActors = Array.isArray(event["myth:involvesActor"]) 
			? event["myth:involvesActor"] 
			: [event["myth:involvesActor"]];

		return {
			id: `${baseUrl}/events/${eventId}`,
			title: event["dct:title"],
			description: event["myth:description"],
			sequence: event["myth:sequence"],
			published: event["as:published"] || new Date().toISOString(),
			actors: involvedActors.map((actorUrl: string) => {
				const username = actorUrl.split('/').pop();
				return actors.find(a => a.preferredUsername === username);
			}).filter((a): a is MythActor => !!a)
		} as MythEvent;
	}).sort((a: MythEvent, b: MythEvent) => a.sequence - b.sequence);
}

export async function parseActors(): Promise<MythActor[]> {
	try {
		return await firestoreGetAllActors();
	} catch (error) {
		console.warn("Firestore actors query failed, falling back to file-based parsing:", error);
		return parseActorsFromFile();
	}
}

export async function parseEvents(): Promise<MythEvent[]> {
	try {
		return await firestoreGetAllEvents();
	} catch (error) {
		console.warn("Firestore events query failed, falling back to file-based parsing:", error);
		return parseEventsFromFile();
	}
}

