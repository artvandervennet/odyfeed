import { createDataStorage } from '~~/server/utils/fileStorage'
import { FILE_PATHS, ENDPOINT_PATHS, DEFAULTS } from '~~/shared/constants'

interface WebIdMappings {
	[webId: string]: {
		username: string
		actorId: string
		createdAt: string
	}
}

export default defineEventHandler((event) => {
	const query = getQuery(event)
	const resource = query.resource as string

	if (!resource) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Missing resource parameter',
		})
	}

	const acctMatch = resource.match(/^acct:([^@]+)@(.+)$/)
	if (!acctMatch) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Invalid resource format. Expected acct:username@domain',
		})
	}

	const username = acctMatch[1]
	const domain = acctMatch[2]

	if (!username || !domain) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Invalid resource format. Expected acct:username@domain',
		})
	}

	const baseUrl = process.env.BASE_URL || DEFAULTS.BASE_URL
	const expectedDomain = new URL(baseUrl).host

	if (domain !== expectedDomain) {
		throw createError({
			statusCode: 404,
			statusMessage: 'Domain not found',
		})
	}

	const storage = createDataStorage()
	const mappingsPath = FILE_PATHS.WEBID_MAPPINGS

	if (!storage.exists(mappingsPath)) {
		throw createError({
			statusCode: 404,
			statusMessage: 'User not found',
		})
	}

	const mappings = storage.read<WebIdMappings>(mappingsPath)
	const userMapping = Object.values(mappings).find((m) => m.username === username)

	if (!userMapping) {
		throw createError({
			statusCode: 404,
			statusMessage: 'User not found',
		})
	}

	const actorUrl = `${baseUrl}${ENDPOINT_PATHS.ACTORS_PROFILE(username)}`

	setHeader(event, 'Content-Type', 'application/jrd+json; charset=utf-8')
	setHeader(event, 'Access-Control-Allow-Origin', '*')

	return {
		subject: resource,
		aliases: [actorUrl],
		links: [
			{
				rel: 'self',
				type: 'application/activity+json',
				href: actorUrl,
			},
			{
				rel: 'http://webfinger.net/rel/profile-page',
				type: 'text/html',
				href: `${baseUrl}/actors/${username}`,
			},
		],
	}
})
