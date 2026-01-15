import { useAuthStore } from '~/stores/authStore'
import type { EnrichedPost } from '~~/shared/types/activitypub'

export const useInteractions = function () {
	const auth = useAuthStore()

	const isLiked = function (post: EnrichedPost): boolean {
		if (!auth.isLoggedIn || !auth.webId) return false
		const webId = auth.webId

		const likes = post.likes
		if (!likes) return false

		if (Array.isArray(likes)) {
			return likes.includes(webId)
		}

		if (likes.orderedItems) {
			return likes.orderedItems.includes(webId)
		}

		if (likes.items) {
			return likes.items.includes(webId)
		}

		return false
	}

	const getLikesCount = function (post: EnrichedPost): number {
		if (Array.isArray(post.likes)) return post.likes.length
		return post.likes?.totalItems || 0
	}

	const getRepliesCount = function (post: EnrichedPost): number {
		if (Array.isArray(post.replies)) return post.replies.length
		return post.replies?.totalItems || 0
	}

	const getActorUsername = function (post: EnrichedPost): string {
		if (!post.actor) return 'unknown'
		return post.actor.preferredUsername || post.actor.id.split('/').pop() || 'unknown'
	}

	const getPostId = function (post: EnrichedPost): string {
		const parts = post.id.split('/')
		return parts[parts.length - 1] || post.id
	}

	return {
		isLiked,
		getLikesCount,
		getRepliesCount,
		getActorUsername,
		getPostId
	}
}

