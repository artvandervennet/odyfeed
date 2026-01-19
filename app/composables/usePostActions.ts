import type { ComputedRef } from 'vue'
import { computed } from 'vue'
import type { EnrichedPost } from '~~/shared/types/activitypub'
import { useLikeMutation, useUndoLikeMutation } from '~/mutations/like'
import { useReplyMutation } from '~/mutations/reply'
import { useAuthStore } from '~/stores/authStore'
import {
	isPostLikedByUser,
	getPostLikesCount,
	getPostRepliesCount,
	extractUsernameAndStatusIdFromPostUrl
} from '~/utils/postHelpers'

export const usePostActions = function (post: ComputedRef<EnrichedPost>) {
	const auth = useAuthStore()
	const likeMutation = useLikeMutation()
	const undoLikeMutation = useUndoLikeMutation()
	const replyMutation = useReplyMutation()

	const liked = computed(() => isPostLikedByUser(post.value, auth.actorId))
	const likesCount = computed(() => getPostLikesCount(post.value))
	const repliesCount = computed(() => getPostRepliesCount(post.value))

	const isLikeLoading = computed(() =>
		likeMutation.isLoading.value || undoLikeMutation.isLoading.value
	)
	const isReplyLoading = computed(() => replyMutation.isLoading.value)

	const handleLike = function (event?: Event) {
		if (event) event.stopPropagation()

		if (!auth.isLoggedIn) {
			console.warn('User must be logged in to like posts')
			return
		}

		if (isLikeLoading.value) return

		if (liked.value) {
			undoLikeMutation.mutate(post.value)
		} else {
			likeMutation.mutate(post.value)
		}
	}

	const handleReply = function (content: string) {
		if (!content.trim()) return

		if (!auth.isLoggedIn) {
			console.warn('User must be logged in to reply')
			return
		}

		replyMutation.mutate({ post: post.value, content })
	}

	const postDetailUrl = computed(() => {
		const { username, statusId } = extractUsernameAndStatusIdFromPostUrl(post.value.id)
		return `/actors/${username}/status/${statusId}`
	})

	return {
		liked,
		likesCount,
		repliesCount,
		isLikeLoading,
		isReplyLoading,
		handleLike,
		handleReply,
		postDetailUrl,
	}
}
