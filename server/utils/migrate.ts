import { readFileSync, readdirSync, existsSync } from 'fs'
import { resolve } from 'path'
import { getFirestore } from './firebase'
import type { MythActor, MythEvent } from '~~/shared/types/activitypub'
import { DATA_PATHS, DEFAULTS } from '~~/shared/constants'

function getBaseUrl() {
	const config = useRuntimeConfig()
	return config.public.baseUrl || DEFAULTS.BASE_URL
}

export async function migrateActorsFromFiles() {
	const db = getFirestore()
	const path = resolve(process.cwd(), DATA_PATHS.ACTORS)

	if (!existsSync(path)) {
		return { migrated: 0, message: 'Actors file not found' }
	}

	const raw = readFileSync(path, 'utf-8')
	const baseUrl = getBaseUrl()
	const jsonld = JSON.parse(raw.replace(/\.\//g, `${baseUrl}/`))
	const actorsData = jsonld['@graph'] || [jsonld]

	let migrated = 0
	for (const a of actorsData) {
		const username = a['@id'].split('/').pop()

		const existingDoc = await db.collection('actors')
			.where('preferredUsername', '==', username)
			.limit(1)
			.get()

		if (!existingDoc.empty) {
			console.log(`Actor ${username} already exists, skipping`)
			continue
		}

		await db.collection('actors').add({
			id: `${baseUrl}/api/actors/${username}`,
			preferredUsername: username,
			name: a['foaf:name'],
			summary: a['as:summary'] || '',
			tone: a['myth:tone'] || '',
			avatar: a['myth:avatar'] || '',
			inbox: `${baseUrl}/api/actors/${username}/inbox`,
			outbox: `${baseUrl}/api/actors/${username}/outbox`,
			createdAt: new Date(),
		})
		migrated++
	}

	return { migrated, message: `Migrated ${migrated} actors` }
}

export async function migrateEventsFromFiles() {
	const db = getFirestore()
	const path = resolve(process.cwd(), DATA_PATHS.EVENTS)

	if (!existsSync(path)) {
		return { migrated: 0, message: 'Events file not found' }
	}

	const raw = readFileSync(path, 'utf-8')
	const baseUrl = getBaseUrl()
	const jsonld = JSON.parse(raw.replace(/\.\//g, `${baseUrl}/`))
	const eventsData = jsonld['@graph'] || [jsonld]

	let migrated = 0
	for (const event of eventsData) {
		const eventId = event['@id'].split('/').pop()

		const existingDoc = await db.collection('events')
			.where('eventId', '==', eventId)
			.limit(1)
			.get()

		if (!existingDoc.empty) {
			console.log(`Event ${eventId} already exists, skipping`)
			continue
		}

		const involvedActors = Array.isArray(event['myth:involvesActor'])
			? event['myth:involvesActor']
			: [event['myth:involvesActor']]

		const involvedActorUsernames = involvedActors.map((url: string) => url.split('/').pop())

		await db.collection('events').add({
			eventId: eventId,
			id: `${baseUrl}/events/${eventId}`,
			title: event['dct:title'],
			description: event['myth:description'],
			sequence: event['myth:sequence'],
			published: event['as:published'] || new Date().toISOString(),
			involvedActors: involvedActorUsernames,
			createdAt: new Date(),
		})
		migrated++
	}

	return { migrated, message: `Migrated ${migrated} events` }
}

export async function migratePostsFromFiles() {
	const db = getFirestore()
	const postsBaseDir = resolve(process.cwd(), DATA_PATHS.POSTS)

	if (!existsSync(postsBaseDir)) {
		return { migrated: 0, message: 'Posts directory not found' }
	}

	let migrated = 0
	const actorDirs = readdirSync(postsBaseDir)

	for (const actorDir of actorDirs) {
		const actorPath = resolve(postsBaseDir, actorDir)
		if (!existsSync(actorPath)) continue

		const files = readdirSync(actorPath).filter(f => f.endsWith('.json') || f.endsWith('.jsonld'))

		for (const file of files) {
			try {
				const content = JSON.parse(readFileSync(resolve(actorPath, file), 'utf-8'))
				const postId = file.replace(/\.(json|jsonld)$/, '')

				const existingDoc = await db.collection('posts')
					.where('postId', '==', postId)
					.where('attributedTo', '==', actorDir)
					.limit(1)
					.get()

				if (!existingDoc.empty) {
					console.log(`Post ${postId} by ${actorDir} already exists, skipping`)
					continue
				}

				await db.collection('posts').add({
					...content,
					postId: postId,
					attributedTo: actorDir,
					likes: [],
					createdAt: new Date(),
				})
				migrated++
			} catch (e) {
				console.error(`Error migrating post ${file} in ${actorDir}:`, e)
			}
		}
	}

	return { migrated, message: `Migrated ${migrated} posts` }
}

export async function runFullMigration() {
	try {
		const actorResults = await migrateActorsFromFiles()
		const eventResults = await migrateEventsFromFiles()
		const postResults = await migratePostsFromFiles()

		return {
			success: true,
			actors: actorResults,
			events: eventResults,
			posts: postResults,
		}
	} catch (error) {
		return {
			success: false,
			error: (error as Error).message,
		}
	}
}

