import { defineQuery, useQuery } from '@pinia/colada'
import type { WebmentionCollectionResponse } from '~~/shared/types/api'
import { queryKeys } from '~/utils/queryKeys'

export const useSiteWebmentionsQuery = defineQuery(() => {
  return useQuery<WebmentionCollectionResponse>({
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
    return useQuery<WebmentionCollectionResponse>({
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


