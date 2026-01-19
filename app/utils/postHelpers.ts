import type { EnrichedPost } from '~~/shared/types/activitypub'

export const isPostLikedByUser = function (post: EnrichedPost, userActorId: string): boolean {
	if (!userActorId) return false

	const likes = post.likes
	if (!likes) return false

	if (Array.isArray(likes)) {
		return likes.includes(userActorId)
	}

	if (likes.orderedItems) {
		return likes.orderedItems.includes(userActorId)
	}

	if (likes.items) {
		return likes.items.includes(userActorId)
	}

	return false
}

export const getPostLikesCount = function (post: EnrichedPost): number {
	if (Array.isArray(post.likes)) return post.likes.length
	return post.likes?.totalItems || 0
}

export const getPostRepliesCount = function (post: EnrichedPost): number {
	if (Array.isArray(post.replies)) return post.replies.length
	return post.replies?.totalItems || 0
}

export const extractUsernameAndStatusIdFromPostUrl = function (postUrl: string): { username: string; statusId: string } {
	const parts = postUrl.split('/')
	const statusIndex = parts.lastIndexOf('status')

	if (statusIndex >= 1) {
		return {
			username: parts[statusIndex - 1] || '',
			statusId: parts[statusIndex + 1] || ''
		}
	}

	return { username: '', statusId: '' }
}

