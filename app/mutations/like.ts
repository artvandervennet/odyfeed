import { defineMutation, useMutation, useQueryCache } from '@pinia/colada'
import { useAuthStore } from '~/stores/authStore'
import { createLikeActivity, sendLikeActivity, createUndoLikeActivity, sendUndoActivity } from '~/api/activities'
import type { EnrichedPost } from '~~/shared/types/activitypub'
import { useSolidPodStorage } from '~/composables/useSolidPodStorage'
import { queryKeys } from '~/utils/queryKeys'

export const useLikeMutation = defineMutation(() => {
	const auth = useAuthStore()
	const queryCache = useQueryCache()
	const podStorage = useSolidPodStorage()

	return useMutation({
		mutation: async (post: EnrichedPost) => {
			if (!auth.isLoggedIn || !auth.actorId || !auth.outbox) {
				throw new Error('Not authenticated')
			}

			if (!post.actor?.inbox) {
				throw new Error('Target actor inbox not found')
			}

			const likeActivity = createLikeActivity(auth.actorId, auth.outbox, post)

			await sendLikeActivity(post.actor.inbox, auth.outbox, likeActivity)

			try {
				await podStorage.saveLikeToPod(post.id, likeActivity)
			} catch (error) {
				console.warn('Failed to save like to Pod:', error)
			}

			return likeActivity
		},
		onSuccess: async () => {
			await queryCache.invalidateQueries({ key: queryKeys.timeline() })
		},
	})
})

export const useUndoLikeMutation = defineMutation(() => {
	const auth = useAuthStore()
	const queryCache = useQueryCache()
	const podStorage = useSolidPodStorage()

	return useMutation({
		mutation: async (post: EnrichedPost) => {
			if (!auth.isLoggedIn || !auth.actorId || !auth.outbox) {
				throw new Error('Not authenticated')
			}

			if (!post.actor?.inbox) {
				throw new Error('Target actor inbox not found')
			}

			const undoActivity = createUndoLikeActivity(auth.actorId, auth.outbox, post)

			await sendUndoActivity(post.actor.inbox, auth.outbox, undoActivity)

			try {
				await podStorage.removeLikeFromPod(post.id)
			} catch (error) {
				console.warn('Failed to remove like from Pod:', error)
			}

			return undoActivity
		},
		onSuccess: async () => {
			await queryCache.invalidateQueries({ key: queryKeys.timeline() })
		},
	})
})

