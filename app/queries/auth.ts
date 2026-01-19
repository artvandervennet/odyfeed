import { defineQuery, useQuery } from '@pinia/colada'
import { getAuthStatus, getUserByWebId } from '~/api/auth'
import { fetchActor } from '~/api/actors'
import type { BackendAuthStatus, UserData, UserProfile } from '~/types'
import { queryKeys } from '~/utils/queryKeys'

export const useAuthStatusQuery = defineQuery(() => {
  return useQuery<BackendAuthStatus>({
    key: queryKeys.auth.status(),
    query: () => getAuthStatus(),
    staleTime: 1000 * 60 * 5,
    refetchOnMount: true,
  })
})

export const useUserDataQuery = defineQuery(() => {
  return (webId: string) => {
    return useQuery<UserData>({
      key: queryKeys.user.data(webId),
      query: () => getUserByWebId(webId),
      enabled: () => !!webId,
      staleTime: 1000 * 60 * 5,
    })
  }
})

export const useUserProfileQuery = defineQuery(() => {
  return (username: string) => {
    return useQuery<UserProfile>({
      key: queryKeys.user.profile(username),
      query: async () => {
        const actor = await fetchActor(username)
        const avatarUrl = actor.icon?.url
        return {
          preferredUsername: actor.preferredUsername,
          name: actor.name,
          avatar: avatarUrl,
          summary: actor.summary,
        }
      },
      enabled: () => !!username,
      staleTime: 1000 * 60 * 5,
    })
  }
})
