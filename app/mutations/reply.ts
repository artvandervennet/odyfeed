import { defineMutation, useMutation, useQueryCache } from '@pinia/colada'
import { createReplyActivity, sendReplyActivity } from '~/api/activities'
import type { EnrichedPost } from '~~/shared/types/activitypub'
import { queryKeys } from '~/utils/queryKeys'
import { validateAuth } from '~/utils/mutationHelpers'

export const useReplyMutation = defineMutation(() => {
	const queryCache = useQueryCache()

	return useMutation({
		onMutate: async ({ post }: { post: EnrichedPost; content: string }) => {
			await queryCache.cancelQueries({ key: queryKeys.timeline() })

			const previousTimeline = queryCache.getQueryData<{ orderedItems: EnrichedPost[] }>(queryKeys.timeline())

			if (previousTimeline) {
				queryCache.setQueryData(queryKeys.timeline(), {
					...previousTimeline,
					orderedItems: previousTimeline.orderedItems.map(p =>
						p.id === post.id
							? {
									...p,
									replies: {
										...p.replies,
										totalItems: (p.replies?.totalItems || 0) + 1
									}
								}
							: p
					)
				})
			}

			return { previousTimeline }
		},
		mutation: async ({ post, content }: { post: EnrichedPost; content: string }) => {
			const { actorId, outbox } = validateAuth()

			if (!post.actor?.inbox) {
				throw new Error('Target actor inbox not found')
			}

			if (!content.trim()) {
				throw new Error('Reply content cannot be empty')
			}

			const { replyNote, createActivity } = createReplyActivity(
				actorId,
				outbox,
				post,
				content.trim()
			)

			await sendReplyActivity(post.actor.inbox, outbox, createActivity)

			return { replyNote, createActivity }
		},
		onError: (_error, _variables, context) => {
			if (context?.previousTimeline) {
				queryCache.setQueryData(queryKeys.timeline(), context.previousTimeline)
			}
		},
		onSuccess: async () => {
			await queryCache.invalidateQueries({ key: queryKeys.timeline() })
		},
	})
})

