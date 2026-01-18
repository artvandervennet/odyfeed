import { defineMutation, useMutation, useQueryCache } from '@pinia/colada'
import { useAuthStore } from '~/stores/authStore'
import { createReplyActivity, sendReplyActivity } from '~/api/activities'
import type { EnrichedPost } from '~~/shared/types/activitypub'
import { useSolidPodStorage } from '~/composables/useSolidPodStorage'
import { queryKeys } from '~/utils/queryKeys'

export const useReplyMutation = defineMutation(() => {
	const auth = useAuthStore()
	const queryCache = useQueryCache()
	const podStorage = useSolidPodStorage()

	return useMutation({
		mutation: async ({ post, content }: { post: EnrichedPost; content: string }) => {
			if (!auth.isLoggedIn || !auth.actorId || !auth.outbox) {
				throw new Error('Not authenticated')
			}

			if (!post.actor?.inbox) {
				throw new Error('Target actor inbox not found')
			}

			if (!content.trim()) {
				throw new Error('Reply content cannot be empty')
			}

			const { replyNote, createActivity } = createReplyActivity(
				auth.actorId,
				auth.outbox,
				post,
				content.trim()
			)

			await sendReplyActivity(post.actor.inbox, auth.outbox, createActivity)

			try {
				await podStorage.saveReplyToPod(replyNote.id, createActivity)
			} catch (error) {
				console.warn('Failed to save reply to Pod:', error)
			}

			return { replyNote, createActivity }
		},
		onSuccess: async () => {
			await queryCache.invalidateQueries({ key: queryKeys.timeline() })
		},
	})
})

