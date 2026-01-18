export const queryKeys = {
	timeline: () => ['timeline'] as const,
	post: (username: string, statusId: string) => ['post', username, statusId] as const,
	replies: (postId: string) => ['replies', postId] as const,
	webmentions: (postId: string) => ['webmentions', postId] as const,
	inbox: (inboxUrl: string) => ['inbox', inboxUrl] as const,
	actorPosts: (username: string) => ['actor-posts', username] as const,
}
