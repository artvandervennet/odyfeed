import { defineQuery, useQuery } from '@pinia/colada'
import type { EnrichedPost, ASNote } from '~~/shared/types/activitypub'
import { extractCollectionItems, enrichNoteWithActor, extractUsernameFromActorUrl } from '~~/shared/types/mappers'
import { fetchNoteByUrl, fetchActor } from '~/api/actors'
import { queryKeys } from '~/utils/queryKeys'

export const useRepliesQuery = defineQuery(() => {
	return (post: ASNote) => {
		return useQuery<EnrichedPost[]>({
			key: queryKeys.replies(post.id),
			query: async () => {
				const replyUrls = extractCollectionItems(post.replies)

				if (replyUrls.length === 0) return []

				const replies = await Promise.all(
					replyUrls.map(url => fetchNoteByUrl(url)),
				)

				return await Promise.all(
					replies.map(async (reply) => {
						const username = extractUsernameFromActorUrl(reply.attributedTo)
						const actor = await fetchActor(username)
						return enrichNoteWithActor(reply, actor)
					}),
				)
			},
			staleTime: 1000 * 60,
		})
	}
})



