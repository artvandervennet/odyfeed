import { defineMutation, useMutation, useQueryCache } from '@pinia/colada'
import type { WebmentionMutationPayload } from '~~/shared/types/mutations'
import type { WebmentionCollectionResponse } from '~~/shared/types/api'
import type { Webmention } from '~~/shared/types/webmention'
import { queryKeys } from '~/utils/queryKeys'

interface SendWebmentionResponse {
	success: boolean
	message?: string
	webmention?: Webmention
}

interface WebmentionContext {
	previousWebmentions?: WebmentionCollectionResponse
	queryKey?: readonly unknown[]
}

export const useSendWebmentionMutation = defineMutation(() => {
	const queryCache = useQueryCache()

	return useMutation({
		onMutate: async ({ source, target, postId }: WebmentionMutationPayload): Promise<WebmentionContext> => {
			if (postId) {
				const parts = postId.split('/')
				if (parts.length >= 2) {
					const username = parts[0]!
					const statusId = parts[1]!
					const queryKey = queryKeys.webmentions.byPost(username, statusId)

					await queryCache.cancelQueries({ key: queryKey })

					const previousWebmentions = queryCache.getQueryData<WebmentionCollectionResponse>(queryKey)

					const optimisticWebmention: Webmention = {
						id: `temp-${Date.now()}`,
						source,
						target,
						type: 'mention',
						verified: false,
						received: new Date().toISOString(),
					}

					if (previousWebmentions) {
						queryCache.setQueryData(queryKey, {
							total: previousWebmentions.total + 1,
							items: [...previousWebmentions.items, optimisticWebmention],
						})
					}

					return { previousWebmentions, queryKey }
				}
			}

			return {}
		},
		mutation: async ({ source, target }: WebmentionMutationPayload): Promise<SendWebmentionResponse> => {
			return await $fetch<SendWebmentionResponse>('/api/webmention', {
				method: 'POST',
				body: { source, target },
			})
		},
		onError: (_error: Error, _variables: WebmentionMutationPayload, context: unknown) => {
			const typedContext = context as WebmentionContext | undefined
			if (typedContext?.previousWebmentions && typedContext?.queryKey) {
				queryCache.setQueryData(typedContext.queryKey as any, typedContext.previousWebmentions)
			}
		},
		onSuccess: async () => {
			await queryCache.invalidateQueries({ key: queryKeys.webmentions.all() })
		},
	})
})


