import { defineQuery, useQuery } from '@pinia/colada'
import type { WebmentionCollection } from '~~/shared/types/webmention'

export const useSiteWebmentionsQuery = defineQuery(() => {
  return useQuery<WebmentionCollection>({
    key: ['webmentions', 'site'],
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
      key: ['webmentions', 'posts', username, statusId],
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
