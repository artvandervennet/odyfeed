import type { EnrichedPost, MythEvent } from '~~/shared/types/activitypub'
import { apiHeaders } from '~/utils/fetch'

export interface TimelineResponse {
  orderedItems: EnrichedPost[]
  totalItems: number
  groupedByEvent: Array<{
    event: MythEvent
    posts: EnrichedPost[]
  }>
}

export const fetchTimeline = async function (): Promise<TimelineResponse> {
  return await $fetch('/api/timeline', {
    headers: apiHeaders,
  })
}

