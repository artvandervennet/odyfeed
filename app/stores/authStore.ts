import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useAuthStatusQuery, useUserDataQuery, useUserProfileQuery } from '~/queries/auth'
import { useRegisterMutation, useLogoutMutation } from '~/mutations/auth'
import { startLoginRedirect } from '~/api/auth'
import type {
  LocalUserSession,
  BackendAuthStatus,
  UserProfile,
  RegisterUserPayload,
} from '~/types'
import { ENDPOINT_PATHS } from '~~/shared/constants'

export const useAuthStore = defineStore('auth', () => {
  // State
  const localUser = ref<LocalUserSession | null>(null)
  const backendAuthStatus = ref<BackendAuthStatus | null>(null)
  const userProfile = ref<UserProfile>({})

  // Queries
  const { data: authStatusData, refetch: refetchAuthStatus } = useAuthStatusQuery()

  // Mutations
  const registerMutation = useRegisterMutation()
  const { mutate: logoutMutate } = useLogoutMutation()

  // Computed
  const isLoggedIn = computed<boolean>(() => !!localUser.value?.username)
  const isAuthenticated = computed<boolean>(() =>
    backendAuthStatus.value?.authenticated || authStatusData.value?.authenticated || false
  )
  const webId = computed<string>(() =>
    localUser.value?.webId || backendAuthStatus.value?.webId || authStatusData.value?.webId || ''
  )
  const username = computed<string>(() => localUser.value?.username || '')
  const actorId = computed<string>(() => localUser.value?.actorId || '')
  const outbox = computed<string>(() => localUser.value?.outbox || '')
  const inbox = computed<string>(() => localUser.value?.inbox || '')

  // Private helper functions
  const loadUserData = async function (webId: string): Promise<void> {
    const baseUrl = window.location.origin

    try {
      const userDataQuery = useUserDataQuery()
      const { data, refetch } = userDataQuery(webId)

      await refetch()

      if (data.value) {
        localUser.value = {
          webId,
          username: data.value.username,
          actorId: data.value.actorId,
          inbox: `${baseUrl}${ENDPOINT_PATHS.ACTORS_INBOX(data.value.username)}`,
          outbox: `${baseUrl}${ENDPOINT_PATHS.ACTORS_OUTBOX(data.value.username)}`,
        }

        await loadUserProfile(data.value.username)
        console.log('[Auth] Local user session loaded:', localUser.value)
      }
    } catch (error: any) {
      if (error.statusCode === 404) {
        console.log('[Auth] User not registered locally, needs registration')
        localUser.value = null
      } else {
        console.error('[Auth] Failed to load local user session:', error)
        throw error
      }
    }
  }

  const loadUserProfile = async function (username: string): Promise<void> {
    if (!username) return

    try {
      const profileQuery = useUserProfileQuery()
      const { data, refetch } = profileQuery(username)

      await refetch()

      if (data.value) {
        userProfile.value = data.value
      }
    } catch (error) {
      console.error('[Auth] Failed to load user profile:', error)
    }
  }

  // Public methods
  const initSession = async function (): Promise<void> {
    console.log('[Auth] Initializing session...')

    try {
      await refetchAuthStatus()
      const status = authStatusData.value

      if (status) {
        backendAuthStatus.value = status

        if (status.authenticated && status.webId) {
          console.log('[Auth] Backend session found:', status)

          try {
            await loadUserData(status.webId)
            console.log('[Auth] Session fully initialized')
          } catch (error: any) {
            if (error.statusCode === 404) {
              console.log('[Auth] User authenticated but not registered')
            } else {
              console.error('[Auth] Failed to load local user session:', error)
            }
          }
        } else {
          console.log('[Auth] No active session')
        }
      }
    } catch (error) {
      console.error('[Auth] Failed to check auth status:', error)
      backendAuthStatus.value = null
      localUser.value = null
    }
  }

  const login = function (issuer: string): void {
    console.log('[Auth] Starting backend OAuth flow with issuer:', issuer)
    startLoginRedirect(issuer)
  }

  const logout = async function (): Promise<void> {
    try {
      logoutMutate()
    } catch (error) {
      console.error('[Auth] Logout error:', error)
      localUser.value = null
      userProfile.value = {}
      backendAuthStatus.value = null
      window.location.href = '/'
    }
  }

  const registerUser = async function (
    username: string,
    profile?: { name?: string; summary?: string }
  ): Promise<void> {
    await refetchAuthStatus()
    const backendStatus = authStatusData.value

    if (!backendStatus?.authenticated || !backendStatus.webId) {
      throw new Error('No WebID found - please login first')
    }

    console.log('[Auth] Registering user:', {
      webId: backendStatus.webId,
      username,
    })

    const payload: RegisterUserPayload = {
      username,
      name: profile?.name,
      summary: profile?.summary,
    }

    try {
      const data = await registerMutation.mutateAsync(payload)

      if (data) {
        localUser.value = {
          webId: backendStatus.webId,
          username: data.username,
          actorId: data.actorId,
          inbox: data.inbox,
          outbox: data.outbox,
        }

        await loadUserProfile(data.username)
        console.log('[Auth] User registered:', localUser.value)
      }
    } catch (error) {
      console.error('[Auth] Registration failed:', error)
      throw error
    }
  }

  return {
    // State
    isLoggedIn,
    isAuthenticated,
    webId,
    username,
    actorId,
    outbox,
    inbox,
    userProfile,
    localUser,
    backendAuthStatus,

    // Methods
    login,
    logout,
    initSession,
    registerUser,
  }
})

