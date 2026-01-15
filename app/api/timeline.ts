import type { EnrichedPost } from '~~/shared/types/activitypub'
import { apiHeaders } from '~/utils/fetch'


export const fetchTimeline = async function (): Promise<{ orderedItems: EnrichedPost[] }> {
  return await $fetch('/api/timeline', {
    headers: apiHeaders,
  })
}

