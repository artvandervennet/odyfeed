import { defineQuery, useQuery } from '@pinia/colada'
import { fetchTimeline } from '~/api/timeline'
import type { TimelineResponse } from '~~/shared/types/api'

export const useTimelineQuery = defineQuery(() => {
	return useQuery<TimelineResponse>({
		key: ['timeline'],
		query: () => fetchTimeline(),
		staleTime: 1000 * 60 * 2,
	})
})


