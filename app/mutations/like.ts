import { defineMutation, useMutation, useQueryCache } from '@pinia/colada'
import { createLikeActivity, sendLikeActivity, createUndoLikeActivity, sendUndoActivity } from '~/api/activities'
import type { EnrichedPost } from '~~/shared/types/activitypub'
import type { TimelineResponse } from '~/api/timeline'
import { queryKeys } from '~/utils/queryKeys'
import { validateAuth } from '~/utils/mutationHelpers'

export const useLikeMutation = defineMutation(() => {
	const queryCache = useQueryCache()

	return useMutation({
		onMutate: async (post: EnrichedPost) => {
			const { actorId } = validateAuth()

			await queryCache.cancelQueries({ key: queryKeys.timeline() })

			const previousTimeline = queryCache.getQueryData<TimelineResponse>(queryKeys.timeline())

			if (previousTimeline) {
				queryCache.setQueryData(queryKeys.timeline(), {
					...previousTimeline,
					orderedItems: previousTimeline.orderedItems.map(p =>
						p.id === post.id
							? {
									...p,
									likes: {
										...p.likes,
										totalItems: (p.likes?.totalItems || 0) + 1,
										orderedItems: [...(p.likes?.orderedItems || []), actorId]
									}
								}
							: p
					)
				})
			}

			return { previousTimeline }
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
		onError: (_error, _post, context) => {
			if (context?.previousTimeline) {
				queryCache.setQueryData(queryKeys.timeline(), context.previousTimeline)
			}
		},
		onSuccess: async () => {
			await queryCache.invalidateQueries({ key: queryKeys.timeline() })
		},
	})
})

export const useUndoLikeMutation = defineMutation(() => {
	const queryCache = useQueryCache()

	return useMutation({
		onMutate: async (post: EnrichedPost) => {
			const { actorId } = validateAuth()

			await queryCache.cancelQueries({ key: queryKeys.timeline() })

			const previousTimeline = queryCache.getQueryData<TimelineResponse>(queryKeys.timeline())

			if (previousTimeline) {
				queryCache.setQueryData(queryKeys.timeline(), {
					...previousTimeline,
					orderedItems: previousTimeline.orderedItems.map(p =>
						p.id === post.id
							? {
									...p,
									likes: {
										...p.likes,
										totalItems: Math.max((p.likes?.totalItems || 0) - 1, 0),
										orderedItems: (p.likes?.orderedItems || []).filter(id => id !== actorId)
									}
								}
							: p
					)
				})
			}

			return { previousTimeline }
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
		onError: (_error, _post, context) => {
			if (context?.previousTimeline) {
				queryCache.setQueryData(queryKeys.timeline(), context.previousTimeline)
			}
		},
		onSuccess: async () => {
			await queryCache.invalidateQueries({ key: queryKeys.timeline() })
		},
	})
})

