import { defineMutation, useMutation, useQueryCache } from '@pinia/colada'
import { createLikeActivity, sendLikeActivity, createUndoLikeActivity, sendUndoActivity } from '~/api/activities'
import type { EnrichedPost } from '~~/shared/types/activitypub'
import type { TimelineResponse } from '~~/shared/types/api'
import type { TimelineMutationContext } from '~~/shared/types/mutations'
import { queryKeys } from '~/utils/queryKeys'
import { validateAuth, createOptimisticUpdateHandlers, updateTimelineWithLike } from '~/utils/mutationHelpers'

export const useLikeMutation = defineMutation(() => {
	const queryCache = useQueryCache()

	const optimisticHandlers = createOptimisticUpdateHandlers<TimelineResponse, EnrichedPost, TimelineMutationContext>(
		queryCache,
		{
			queryKey: queryKeys.timeline(),
			updateCacheFn: (currentData, post, actorId) => ({
				...currentData!,
				orderedItems: updateTimelineWithLike(currentData!.orderedItems, post.id, actorId, false)
			}),
			rollbackOnError: true,
		}
	)

	return useMutation({
		onMutate: async (post: EnrichedPost) => {
			const context = await optimisticHandlers.onMutate(post)
			return { previousTimeline: context.previousData }
		},
		mutation: async (post: EnrichedPost) => {
			const { actorId, outbox } = validateAuth()

			if (!post.actor?.inbox) {
				throw new Error('Target actor inbox not found')
			}

			const likeActivity = createLikeActivity(actorId, outbox, post)
			await sendLikeActivity(post.actor.inbox, outbox, likeActivity)

			return likeActivity
		},
		onError: optimisticHandlers.onError,
		onSuccess: optimisticHandlers.onSuccess,
	})
})

export const useUndoLikeMutation = defineMutation(() => {
	const queryCache = useQueryCache()

	const optimisticHandlers = createOptimisticUpdateHandlers<TimelineResponse, EnrichedPost, TimelineMutationContext>(
		queryCache,
		{
			queryKey: queryKeys.timeline(),
			updateCacheFn: (currentData, post, actorId) => ({
				...currentData!,
				orderedItems: updateTimelineWithLike(currentData!.orderedItems, post.id, actorId, true)
			}),
			rollbackOnError: true,
		}
	)

	return useMutation({
		onMutate: async (post: EnrichedPost) => {
			const context = await optimisticHandlers.onMutate(post)
			return { previousTimeline: context.previousData }
		},
		mutation: async (post: EnrichedPost) => {
			const { actorId, outbox } = validateAuth()

			if (!post.actor?.inbox) {
				throw new Error('Target actor inbox not found')
			}

			const undoActivity = createUndoLikeActivity(actorId, outbox, post)
			await sendUndoActivity(post.actor.inbox, outbox, undoActivity)

			return undoActivity
		},
		onError: optimisticHandlers.onError,
		onSuccess: optimisticHandlers.onSuccess,
	})
})



