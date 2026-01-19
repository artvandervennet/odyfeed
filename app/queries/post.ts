import type { EnrichedPost } from '~~/shared/types/activitypub'
import { fetchActorStatus } from '~/api/actors'
import { queryKeys } from '~/utils/queryKeys'

export const usePostQuery = defineQuery(() => {
	return (statusId: string) => {
		return useQuery<EnrichedPost>({
			key: queryKeys.post(statusId),
			query: () => fetchActorStatus(statusId),
			staleTime: 1000 * 60 * 5,
		})
	}
})

