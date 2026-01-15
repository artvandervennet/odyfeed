import type {EnrichedPost} from '~~/shared/types/activitypub'
import {fetchActorStatus} from '~/api/actors'

export const usePostQuery = defineQuery(() => {
	return (username: string, statusId: string) => {
		return useQuery<EnrichedPost>({
			key: ['post', username, statusId],
			query: () => fetchActorStatus(username, statusId),
			staleTime: 1000 * 60 * 5,
		})
	}
})

