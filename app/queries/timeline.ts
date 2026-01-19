import { defineQuery, useQuery } from '@pinia/colada'
import { fetchTimeline, type TimelineResponse } from '~/api/timeline'

export const useTimelineQuery = defineQuery(() => {
	return useQuery<TimelineResponse>({
		key: ['timeline'],
		query: () => fetchTimeline(),
		staleTime: 1000 * 60 * 2,
	})
})
