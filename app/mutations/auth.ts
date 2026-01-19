import { defineMutation, useMutation, useQueryCache } from '@pinia/colada'
import { registerNewUser, logoutUser } from '~/api/auth'
import type { RegisterUserRequest, RegisterUserResponse } from '~~/shared/types/api'
import { queryKeys } from '~/utils/queryKeys'

export const useRegisterMutation = defineMutation(() => {
  const queryCache = useQueryCache()

  return useMutation<RegisterUserResponse, RegisterUserRequest>({
    mutation: async (payload) => {
      return await registerNewUser(payload)
    },
    onSuccess: async () => {
      await queryCache.invalidateQueries({ key: queryKeys.auth.all() })
      await queryCache.invalidateQueries({ key: queryKeys.user.all() })
    },
  })
})

export const useLogoutMutation = defineMutation(() => {
  const queryCache = useQueryCache()

  return useMutation({
    mutation: async () => {
      return await logoutUser()
    },
    onSuccess: async () => {
      await queryCache.invalidateQueries({ key: queryKeys.auth.all() })
      await queryCache.invalidateQueries({ key: queryKeys.user.all() })
      await queryCache.invalidateQueries({ key: queryKeys.timeline() })
      window.location.href = '/'
    },
  })
})


