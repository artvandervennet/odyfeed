import type { TimelineResponse } from '~~/shared/types/api'
import { apiHeaders } from '~/utils/fetch'

export const fetchTimeline = async function (): Promise<TimelineResponse> {
  return await $fetch('/api/timeline', {
    headers: apiHeaders,
  })
}



