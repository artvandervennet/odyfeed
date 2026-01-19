import { defineMutation, useMutation, useQueryCache } from '@pinia/colada'
import { createReplyActivity, sendReplyActivity } from '~/api/activities'
import type { TimelineResponse } from '~~/shared/types/api'
import type { ReplyMutationPayload } from '~~/shared/types/mutations'
import { queryKeys } from '~/utils/queryKeys'
import { validateAuth, updateTimelineWithReply } from '~/utils/mutationHelpers'

export const useReplyMutation = defineMutation(() => {
	const queryCache = useQueryCache()

	return useMutation({
		onMutate: async ({ post }: ReplyMutationPayload) => {
			const { actorId } = validateAuth()

			await queryCache.cancelQueries({ key: queryKeys.timeline() })

			const previousTimeline = queryCache.getQueryData<TimelineResponse>(queryKeys.timeline())

			const optimisticReplyId = `${actorId}/outbox/${crypto.randomUUID()}`

			if (previousTimeline) {
				queryCache.setQueryData(queryKeys.timeline(), {
					...previousTimeline,
					orderedItems: updateTimelineWithReply(previousTimeline.orderedItems, post.id, optimisticReplyId)
				})
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



