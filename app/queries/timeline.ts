import { defineQuery, useQuery } from '@pinia/colada'
import { fetchTimeline } from '~/api/timeline'
import type { EnrichedPost } from '~~/shared/types/activitypub'

export const useTimelineQuery = defineQuery(() => {
	return useQuery<{ orderedItems: EnrichedPost[] }>({
		key: ['timeline'],
		query: () => fetchTimeline(),
		staleTime: 1000 * 60 * 2,
	})
})
