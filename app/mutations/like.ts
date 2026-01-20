import { defineMutation, useMutation, useQueryCache } from '@pinia/colada'
import { createLikeActivity, sendLikeActivity, createUndoLikeActivity, sendUndoActivity } from '~/api/activities'
import type { EnrichedPost } from '~~/shared/types/activitypub'
import type { TimelineResponse } from '~~/shared/types/api'
import { queryKeys } from '~/utils/queryKeys'
import { validateAuth } from '~/utils/authHelper'

export const useLikeMutation = defineMutation(() => {
	const queryCache = useQueryCache()

	return useMutation({
		onMutate: async (post: EnrichedPost) => {
			const { actorId } = validateAuth()

			await queryCache.cancelQueries({ key: queryKeys.timeline() })

			const previousTimeline = queryCache.getQueryData<TimelineResponse>(queryKeys.timeline())

			if (previousTimeline) {
				const updatePost = (item: EnrichedPost) => {
					if (item.id !== post.id) return item

					const currentLikes = item.likes || {
						id: `${item.id}/likes`,
						type: 'OrderedCollection' as const,
						totalItems: 0,
						orderedItems: []
					}

					return {
						...item,
						likes: {
							...currentLikes,
							totalItems: (currentLikes.totalItems || 0) + 1,
							orderedItems: [...(currentLikes.orderedItems || []), actorId]
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
				const updatePost = (item: EnrichedPost) => {
					if (item.id !== post.id) return item

					const currentLikes = item.likes || {
						id: `${item.id}/likes`,
						type: 'OrderedCollection' as const,
						totalItems: 0,
						orderedItems: []
					}

					return {
						...item,
						likes: {
							...currentLikes,
							totalItems: Math.max((currentLikes.totalItems || 0) - 1, 0),
							orderedItems: (currentLikes.orderedItems || []).filter(id => id !== actorId)
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

