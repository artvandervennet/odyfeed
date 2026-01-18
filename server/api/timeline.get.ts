import { createDataStorage } from '~~/server/utils/fileStorage'
import { parseActors } from '~~/server/utils/rdf'
import { FILE_PATHS } from '~~/shared/constants'
import { logError, logInfo } from '~~/server/utils/logger'
import type { ASNote, EnrichedPost } from '~~/shared/types/activitypub'

export default defineEventHandler(async (event) => {
	try {
		const storage = createDataStorage()
		const mythActors = parseActors()

		logInfo(`[Timeline] Fetching posts for ${mythActors.length} myth actors`)

		const allPosts: EnrichedPost[] = []

		for (const actor of mythActors) {
			const username = actor.preferredUsername
			const actorPostsDir = `${FILE_PATHS.POSTS_DIR}/${username}`

			if (!storage.exists(actorPostsDir)) {
				continue
			}

			try {
				const postFiles = storage.listFiles(actorPostsDir, '.jsonld')

				for (const fileName of postFiles) {
					const postPath = `${actorPostsDir}/${fileName}`

					try {
						const post = storage.read<ASNote>(postPath)

						if (post && post.id && post.type === 'Note') {
							const enrichedPost: EnrichedPost = {
								...post,
								actor,
							}
							allPosts.push(enrichedPost)
						}
					} catch (error) {
						logError(`[Timeline] Failed to read post file: ${postPath}`, error)
					}
				}

				logInfo(`[Timeline] Loaded ${postFiles.length} posts for ${username}`)
			} catch (error) {
				logError(`[Timeline] Failed to list posts for ${username}`, error)
			}
		}

		allPosts.sort((a, b) => {
			const dateA = new Date(a.published || 0).getTime()
			const dateB = new Date(b.published || 0).getTime()
			return dateB - dateA
		})

		logInfo(`[Timeline] Returning ${allPosts.length} total posts`)

		setHeader(event, 'Content-Type', 'application/json')
		setHeader(event, 'Cache-Control', 'public, max-age=60')

		return {
			orderedItems: allPosts,
			totalItems: allPosts.length,
		}
	} catch (error) {
		logError('[Timeline] Failed to fetch timeline', error)
		throw createError({
			statusCode: 500,
			statusMessage: 'Failed to fetch timeline',
		})
	}
})
