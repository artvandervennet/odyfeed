import type { EnrichedPost } from '~~/shared/types/activitypub'

export const isPostLikedByUser = function (post: EnrichedPost, userWebId: string): boolean {
	if (!userWebId) return false

	const likes = post.likes
	if (!likes) return false

	if (Array.isArray(likes)) {
		return likes.includes(userWebId)
	}

	if (likes.orderedItems) {
		return likes.orderedItems.includes(userWebId)
	}

	if (likes.items) {
		return likes.items.includes(userWebId)
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

export const extractStatusIdFromPostUrl = function (postUrl: string): string {
	return postUrl.split('/').pop() || ''
}
