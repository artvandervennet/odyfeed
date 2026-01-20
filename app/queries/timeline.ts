import { defineQuery, useQuery } from '@pinia/colada'
import { fetchTimeline } from '~/api/timeline'
import type { TimelineResponse } from '~~/shared/types/api'
import {queryKeys} from "~/utils/queryKeys";

export const useTimelineQuery = defineQuery(() => {
	return useQuery<TimelineResponse>({
		key:  queryKeys.timeline() ,
		query: () => fetchTimeline(),
		staleTime: 1000 * 30,
		refetchOnMount: true,
	})
})


