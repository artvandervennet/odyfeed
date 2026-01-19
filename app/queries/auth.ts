import { defineQuery, useQuery } from '@pinia/colada'
import { getAuthStatus, getUserByWebId } from '~/api/auth'
import { fetchActor } from '~/api/actors'
import type { AuthStatusResponse, UserDataResponse, UserProfileResponse } from '~~/shared/types/api'
import { transformActorToProfile } from '~~/shared/types/mappers'
import { queryKeys } from '~/utils/queryKeys'

export const useAuthStatusQuery = defineQuery(() => {
  return useQuery<AuthStatusResponse>({
    key: queryKeys.auth.status(),
    query: () => getAuthStatus(),
    staleTime: 1000 * 60 * 5,
    refetchOnMount: true,
  })
})

export const useUserDataQuery = defineQuery(() => {
  return (webId: string) => {
    return useQuery<UserDataResponse>({
      key: queryKeys.user.data(webId),
      query: () => getUserByWebId(webId),
      enabled: () => !!webId,
      staleTime: 1000 * 60 * 5,
    })
  }
})

export const useUserProfileQuery = defineQuery(() => {
  return (username: string) => {
    return useQuery<UserProfileResponse>({
      key: queryKeys.user.profile(username),
      query: async () => {
        const actor = await fetchActor(username)
        return transformActorToProfile(actor)
      },
      enabled: () => !!username,
      staleTime: 1000 * 60 * 5,
    })
  }
})


