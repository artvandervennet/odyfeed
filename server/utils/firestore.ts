import { getFirestore as getFirestoreInstance } from './firebase'
import type { MythActor, MythEvent } from '~~/shared/types/activitypub'
import { DEFAULTS } from '~~/shared/constants'

function getBaseUrl() {
	return process.env.ODYSSEY_BASE_URL || DEFAULTS.BASE_URL
}

function transformActorDoc(doc: Record<string, any>, baseUrl: string): MythActor {
	return {
		id: `${baseUrl}/api/actors/${doc.preferredUsername}`,
		preferredUsername: doc.preferredUsername,
		name: doc.name,
		summary: doc.summary || '',
		tone: doc.tone || '',
		avatar: doc.avatar || '',
		inbox: `${baseUrl}/api/actors/${doc.preferredUsername}/inbox`,
		outbox: `${baseUrl}/api/actors/${doc.preferredUsername}/outbox`
	}
}

function transformEventDoc(doc: Record<string, any>, actors: MythActor[], baseUrl: string): MythEvent {
	const involvedActorIds = Array.isArray(doc.involvedActors)
		? doc.involvedActors
		: [doc.involvedActors].filter(Boolean)

	return {
		id: `${baseUrl}/events/${doc.eventId}`,
		title: doc.title,
		description: doc.description,
		sequence: doc.sequence || 0,
		published: doc.published || new Date().toISOString(),
		actors: involvedActorIds
			.map((username: string) => actors.find((a: MythActor) => a.preferredUsername === username))
			.filter((a: MythActor | undefined): a is MythActor => !!a)
	}
}

export async function getActor(preferredUsername: string): Promise<MythActor | null> {
	const db = getFirestoreInstance()
	const baseUrl = getBaseUrl()

	const doc = await db.collection('actors')
		.where('preferredUsername', '==', preferredUsername)
		.limit(1)
		.get()

	if (doc.empty) return null

	const data = doc.docs[0].data()
	return transformActorDoc(data, baseUrl)
}

export async function getAllActors(): Promise<MythActor[]> {
	const db = getFirestoreInstance()
	const baseUrl = getBaseUrl()

	const docs = await db.collection('actors').get()

	return docs.docs.map((doc: { data: () => Record<string, any> }) => transformActorDoc(doc.data(), baseUrl))
}

export async function getEvent(eventId: string): Promise<MythEvent | null> {
	const db = getFirestoreInstance()
	const baseUrl = getBaseUrl()
	const actors = await getAllActors()

	const doc = await db.collection('events')
		.where('eventId', '==', eventId)
		.limit(1)
		.get()

	if (doc.empty) return null

	const data = doc.docs[0].data()
	return transformEventDoc(data, actors, baseUrl)
}

export async function getAllEvents(): Promise<MythEvent[]> {
	const db = getFirestoreInstance()
	const baseUrl = getBaseUrl()
	const actors = await getAllActors()

	const docs = await db.collection('events')
		.orderBy('sequence', 'asc')
		.get()

	return docs.docs.map((doc: { data: () => Record<string, any> }) => transformEventDoc(doc.data(), actors, baseUrl))
}

export async function getPost(actorUsername: string, postId: string): Promise<Record<string, any> | null> {
	const db = getFirestoreInstance()

	const doc = await db.collection('posts')
		.where('attributedTo', '==', actorUsername)
		.where('postId', '==', postId)
		.limit(1)
		.get()

	if (doc.empty) return null

	return doc.docs[0].data()
}

export async function getAllPosts(limit: number = 100): Promise<Array<Record<string, any>>> {
	const db = getFirestoreInstance()
	const actors = await getAllActors()

	const docs = await db.collection('posts')
		.orderBy('published', 'desc')
		.limit(limit)
		.get()

	return docs.docs.map((doc: { data: () => any }) => {
		const data = doc.data()
		const actor = actors.find((a: MythActor) => a.preferredUsername === data.attributedTo)
		return {
			...data,
			actor
		}
	})
}

export async function createPost(postData: Record<string, any>): Promise<string> {
	const db = getFirestoreInstance()

	const docRef = await db.collection('posts').add({
		...postData,
		createdAt: new Date(),
		updatedAt: new Date()
	})

	return docRef.id
}

export async function postExists(postId: string, actorUsername: string): Promise<boolean> {
	const db = getFirestoreInstance()

	const doc = await db.collection('posts')
		.where('postId', '==', postId)
		.where('attributedTo', '==', actorUsername)
		.limit(1)
		.get()

	return !doc.empty
}

export async function addLike(postDocId: string, actorUsername: string): Promise<void> {
	const db = getFirestoreInstance()

	await db.collection('posts')
		.doc(postDocId)
		.collection('likes')
		.add({
			actor: actorUsername,
			createdAt: new Date()
		})
}

export async function removeLike(postDocId: string, actorUsername: string): Promise<void> {
	const db = getFirestoreInstance()

	const likeDocs = await db.collection('posts')
		.doc(postDocId)
		.collection('likes')
		.where('actor', '==', actorUsername)
		.get()

	for (const doc of likeDocs.docs) {
		await doc.ref.delete()
	}
}

export async function getLikesCount(postDocId: string): Promise<number> {
	const db = getFirestoreInstance()

	const docs = await db.collection('posts')
		.doc(postDocId)
		.collection('likes')
		.get()

	return docs.size
}

