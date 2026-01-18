import type { EnrichedPost, ASNote } from '~~/shared/types/activitypub'
import { fetchNoteByUrl, fetchActor } from '~/api/actors'
import { queryKeys } from '~/utils/queryKeys'

export const useRepliesQuery = defineQuery(() => {
	return (post: ASNote) => {
		return useQuery<EnrichedPost[]>({
			key: queryKeys.replies(post.id),
			query: async () => {
				if (!post.replies?.orderedItems && !post.replies?.items) return []

				const replyUrls = post.replies.orderedItems || post.replies.items || []

				const replies = await Promise.all(
					replyUrls.map(url => fetchNoteByUrl(url)),
				)

				return await Promise.all(
					replies.map(async (reply) => {
						const actorUrl = reply.attributedTo
						const username = actorUrl.split('/').pop() || ''
						const actor = await fetchActor(username)
						return {
							...reply,
							actor,
						} as EnrichedPost
					}),
				)
			},
			staleTime: 1000 * 60,
		})
	}
})

