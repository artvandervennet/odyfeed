import { defineQuery, useQuery } from '@pinia/colada'
import type { WebmentionCollection } from '~~/shared/types/webmention'
import { queryKeys } from '~/utils/queryKeys'

export const useSiteWebmentionsQuery = defineQuery(() => {
  return useQuery<WebmentionCollection>({
    key: queryKeys.webmentions.site(),
    query: async () => {
      const response = await fetch('/api/webmentions/site')
      if (!response.ok) {
        return { total: 0, items: [] }
      }
      return response.json()
    },
    staleTime: 1000 * 60 * 5,
  })
})

export const usePostWebmentionsQuery = defineQuery(() => {
  return (username: string, statusId: string) => {
    return useQuery<WebmentionCollection>({
      key: queryKeys.webmentions.byPost(username, statusId),
      query: async () => {
        const response = await fetch(`/api/webmentions/posts/${username}/${statusId}`)
        if (!response.ok) {
          return { total: 0, items: [] }
        }
        return response.json()
      },
      staleTime: 1000 * 60 * 5,
    })
  }
})
