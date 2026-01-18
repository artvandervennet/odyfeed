import type { SolidDataset, Thing } from '@inrupt/solid-client'
import {
	getSolidDataset,
	saveSolidDatasetAt,
	createSolidDataset,
	createThing,
	setThing,
	buildThing,
} from '@inrupt/solid-client'

export const getOrCreateDataset = async function (
	url: string,
	fetch: typeof globalThis.fetch
): Promise<SolidDataset> {
	try {
		return await getSolidDataset(url, { fetch })
	} catch {
		return createSolidDataset()
	}
}

export const saveThing = async function (
	containerUrl: string,
	thingUrl: string,
	thing: Thing,
	fetch: typeof globalThis.fetch
): Promise<boolean> {
	try {
		let dataset = await getOrCreateDataset(containerUrl, fetch)
		dataset = setThing(dataset, thing)
		await saveSolidDatasetAt(containerUrl, dataset, { fetch })
		return true
	} catch (error) {
		return false
	}
}

export const buildActivityThing = function (
	url: string,
	activity: any,
	namespace: string
) {
	return buildThing(createThing({ url }))
		.addStringNoLocale(namespace + '#type', activity.type)
		.addStringNoLocale(namespace + '#id', activity.id)
		.addStringNoLocale(namespace + '#content', activity.content || activity.object?.content || '')
		.addDatetime(namespace + '#published', new Date(activity.published || Date.now()))
		.build()
}

export const buildNoteThing = function (
	url: string,
	note: any,
	namespace: string
) {
	return buildThing(createThing({ url }))
		.addStringNoLocale(namespace + '#type', 'Note')
		.addStringNoLocale(namespace + '#id', note.id)
		.addStringNoLocale(namespace + '#content', note.content)
		.addStringNoLocale(namespace + '#inReplyTo', note.inReplyTo)
		.addStringNoLocale(namespace + '#attributedTo', note.attributedTo)
		.addDatetime(namespace + '#published', new Date(note.published || Date.now()))
		.build()
}
