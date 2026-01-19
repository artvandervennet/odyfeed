import { defineMutation, useMutation, useQueryCache } from '@pinia/colada'
import { queryKeys } from '~/utils/queryKeys'

interface SendWebmentionPayload {
	source: string
	target: string
}

interface SendWebmentionResponse {
	success: boolean
	message?: string
}

export const useSendWebmentionMutation = defineMutation(() => {
	const queryCache = useQueryCache()

	return useMutation<SendWebmentionResponse, SendWebmentionPayload>({
		mutation: async ({ source, target }) => {
			return await $fetch<SendWebmentionResponse>('/api/webmention', {
				method: 'POST',
				body: { source, target },
			})
		},
		onSuccess: async () => {
			await queryCache.invalidateQueries({ key: queryKeys.webmentions.all() })
		},
	})
})
