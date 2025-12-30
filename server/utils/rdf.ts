import { Parser } from "n3";
import { readFileSync } from "fs";
import { resolve } from "path";

export interface Actor {
	id: string;
	preferredUsername: string;
	name: string;
	summary: string;
	tone: string;
	avatar: string;
	inbox: string;
	outbox: string;
}

export interface Event {
	id: string;
	title: string;
	description: string;
	sequence: number;
	actorId: string;
	published: string;
	actor?: Actor;
}

const NS = {
	myth: "https://odyfeed.artvandervennet.ikdoeict.be/vocab#",
	as: "https://www.w3.org/ns/activitystreams#",
	foaf: "http://xmlns.com/foaf/0.1/",
	dct: "http://purl.org/dc/terms/"
};

export function parseActors(): Actor[] {
	const path = resolve(process.cwd(), "data/rdf/actors.ttl");
	const ttl = readFileSync(path, "utf-8");
	const parser = new Parser();
	const quads = parser.parse(ttl);

	const actorMap: Record<string, Partial<Actor>> = {};

	for (const quad of quads) {
		const subject = quad.subject.value;
		if (!actorMap[subject]) actorMap[subject] = { id: subject };

		const p = quad.predicate.value;
		const o = quad.object.value;

		if (p === NS.as + "preferredUsername") actorMap[subject].preferredUsername = o;
		if (p === NS.foaf + "name") actorMap[subject].name = o;
		if (p === NS.as + "summary") actorMap[subject].summary = o;
		if (p === NS.myth + "tone") actorMap[subject].tone = o;
		if (p === NS.myth + "avatar") actorMap[subject].avatar = o;
		if (p === NS.as + "inbox") actorMap[subject].inbox = o;
		if (p === NS.as + "outbox") actorMap[subject].outbox = o;
	}

	return Object.values(actorMap) as Actor[];
}

export function parseEvents(): Event[] {
	const path = resolve(process.cwd(), "data/rdf/events.ttl");
	const ttl = readFileSync(path, "utf-8");
	const parser = new Parser();
	const quads = parser.parse(ttl);

	const eventMap: Record<string, Partial<Event>> = {};

	for (const quad of quads) {
		const subject = quad.subject.value;
		if (!eventMap[subject]) eventMap[subject] = { id: subject };

		const p = quad.predicate.value;
		const o = quad.object.value;

		if (p === NS.dct + "title") eventMap[subject].title = o;
		if (p === NS.myth + "description") eventMap[subject].description = o;
		if (p === NS.myth + "sequence") eventMap[subject].sequence = parseInt(o);
		if (p === NS.myth + "involvesActor") eventMap[subject].actorId = o;
		if (p === NS.as + "published") eventMap[subject].published = o;
	}

	const actors = parseActors();
	const events = Object.values(eventMap) as Event[];

	return events.map(event => ({
		...event,
		actor: actors.find(a => a.id === event.actorId)
	})).sort((a, b) => a.sequence - b.sequence);
}
