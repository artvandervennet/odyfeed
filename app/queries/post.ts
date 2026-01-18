import type { EnrichedPost } from '~~/shared/types/activitypub'
import { fetchActorStatus } from '~/api/actors'
import { queryKeys } from '~/utils/queryKeys'

export const usePostQuery = defineQuery(() => {
	return (username: string, statusId: string) => {
		return useQuery<EnrichedPost>({
			key: queryKeys.post(username, statusId),
			query: () => fetchActorStatus(username, statusId),
			staleTime: 1000 * 60 * 5,
		})
	}
})

