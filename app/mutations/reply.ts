import { defineMutation, useMutation, useQueryCache } from '@pinia/colada'
import { createReplyActivity, sendReplyActivity } from '~/api/activities'
import type { EnrichedPost } from '~~/shared/types/activitypub'
import type { TimelineResponse } from '~~/shared/types/api'
import type { ReplyMutationPayload } from '~~/shared/types/mutations'
import { queryKeys } from '~/utils/queryKeys'
import { validateAuth } from '~/utils/authHelper'

export const useReplyMutation = defineMutation(() => {
	const queryCache = useQueryCache()

	return useMutation({
		onMutate: async ({ post }: ReplyMutationPayload) => {
			const { actorId } = validateAuth()

			await queryCache.cancelQueries({ key: queryKeys.timeline() })

			const previousTimeline = queryCache.getQueryData<TimelineResponse>(queryKeys.timeline())

			const optimisticReplyId = `${actorId}/outbox/${crypto.randomUUID()}`

			if (previousTimeline) {
				const updatePost = (item: EnrichedPost) => {
					if (item.id !== post.id) return item

					const currentReplies = item.replies || {
						id: `${item.id}/replies`,
						type: 'OrderedCollection' as const,
						totalItems: 0,
						orderedItems: []
					}

					return {
						...item,
						replies: {
							...currentReplies,
							totalItems: (currentReplies.totalItems || 0) + 1,
							orderedItems: [...(currentReplies.orderedItems || []), optimisticReplyId]
						}
					}
				}

				const updatedTimeline: TimelineResponse = {
					...previousTimeline,
					orderedItems: previousTimeline.orderedItems.map(updatePost),
					groupedByEvent: previousTimeline.groupedByEvent?.map(group => ({
						...group,
						posts: group.posts.map(updatePost)
					}))
				}

				queryCache.setQueryData(queryKeys.timeline(), updatedTimeline)
			}

			return { previousTimeline }
		},
		mutation: async ({ post, content }: ReplyMutationPayload) => {
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
			await queryCache.invalidateQueries({ key: ['replies'] })
		},
	})
})



