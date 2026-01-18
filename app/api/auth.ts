import type {
  BackendAuthStatus,
  UserData,
  RegisterUserPayload,
  RegisterUserResponse,
} from '~/types'

export const getAuthStatus = async function (): Promise<BackendAuthStatus> {
  return await $fetch<BackendAuthStatus>('/api/auth/status', {
    credentials: 'include',
  })
}

export const startLoginRedirect = function (issuer: string): void {
  window.location.href = `/api/auth/login?issuer=${encodeURIComponent(issuer)}`
}

export const logoutUser = async function (): Promise<{ success: boolean }> {
  return await $fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  })
}

export const getUserByWebId = async function (webId: string): Promise<UserData> {
  return await $fetch<UserData>(`/api/users/me?webId=${encodeURIComponent(webId)}`, {
    credentials: 'include',
  })
}

export const registerNewUser = async function (payload: RegisterUserPayload): Promise<RegisterUserResponse> {
  return await $fetch<RegisterUserResponse>('/api/users/register', {
    method: 'POST',
    body: payload,
    credentials: 'include',
  })
}
