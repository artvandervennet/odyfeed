import { defineMutation, useMutation, useQueryCache } from '@pinia/colada'
import { registerNewUser, logoutUser } from '~/api/auth'
import type { RegisterUserPayload, RegisterUserResponse } from '~/types'

export const useRegisterMutation = defineMutation(() => {
  const queryCache = useQueryCache()

  return useMutation<RegisterUserResponse, RegisterUserPayload>({
    mutation: async (payload) => {
      return await registerNewUser(payload)
    },
    onSuccess: async () => {
      await queryCache.invalidateQueries({ key: ['auth'] })
      await queryCache.invalidateQueries({ key: ['user'] })
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
      await queryCache.invalidateQueries({ key: ['auth'] })
      await queryCache.invalidateQueries({ key: ['user'] })
      await queryCache.invalidateQueries({ key: ['timeline'] })
      window.location.href = '/'
    },
  })
})
