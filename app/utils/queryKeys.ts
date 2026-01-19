export const queryKeys = {
	auth: {
		status: () => ['auth', 'status'] as const,
		all: () => ['auth'] as const,
	},
	user: {
		data: (webId: string) => ['user', 'data', webId] as const,
		profile: (username: string) => ['user', 'profile', username] as const,
		all: () => ['user'] as const,
	},
	timeline: () => ['timeline'] as const,
	post: (username: string, statusId: string) => ['post', username, statusId] as const,
	replies: (postId: string) => ['replies', postId] as const,
	webmentions: {
		post: (postId: string) => ['webmentions', postId] as const,
		site: () => ['webmentions', 'site'] as const,
		byPost: (username: string, statusId: string) => ['webmentions', 'posts', username, statusId] as const,
		all: () => ['webmentions'] as const,
	},
	inbox: (inboxUrl: string) => ['inbox', inboxUrl] as const,
	actors: {
		byUsername: (username: string) => ['actors', username] as const,
		outbox: (username: string) => ['outbox', username] as const,
		posts: (username: string) => ['actor-posts', username] as const,
	},
}
