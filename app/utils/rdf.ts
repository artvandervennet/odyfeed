import { Parser } from "n3";
import { readFileSync } from "fs";

export interface Event {
	id: string;
	title: string;
	description: string;
	sequence: number;
	actor: string;
}

export function parseEvents(): Event[] {
	const ttl = readFileSync("./data/rdf/events.ttl", "utf-8");
	const parser = new Parser();
	const quads = parser.parse(ttl);

	const eventMap: Record<string, Partial<Event>> = {};

	console.log(quads)

	for (const quad of quads) {
		const subject = quad.subject.value;
		if (!eventMap[subject]) eventMap[subject] = { id: subject };

		if (quad.predicate.value.endsWith("title")) {
			eventMap[subject].title = quad.object.value;
		}
		if (quad.predicate.value.endsWith("description")) {
			eventMap[subject].description = quad.object.value;
		}
		if (quad.predicate.value.endsWith("sequence")) {
			eventMap[subject].sequence = parseInt(quad.object.value);
		}
		if (quad.predicate.value.endsWith("involvesActor")) {
			eventMap[subject].actor = quad.object.value;
		}

	}

	return Object.values(eventMap) as Event[];
}
