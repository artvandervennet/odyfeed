import type {
  AuthStatusResponse,
  UserDataResponse,
  RegisterUserRequest,
  RegisterUserResponse,
  LogoutResponse,
} from '~~/shared/types/api'

export const getAuthStatus = async function (): Promise<AuthStatusResponse> {
  return await $fetch<AuthStatusResponse>('/api/auth/status', {
    credentials: 'include',
  })
}

export const startLoginRedirect = function (issuer: string): void {
  window.location.href = `/api/auth/login?issuer=${encodeURIComponent(issuer)}`
}

export const logoutUser = async function (): Promise<LogoutResponse> {
  return await $fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  })
}

export const getUserByWebId = async function (webId: string): Promise<UserDataResponse> {
  return await $fetch<UserDataResponse>(`/api/users/me?webId=${encodeURIComponent(webId)}`, {
    credentials: 'include',
  })
}

export const registerNewUser = async function (payload: RegisterUserRequest): Promise<RegisterUserResponse> {
  return await $fetch<RegisterUserResponse>('/api/users/register', {
    method: 'POST',
    body: payload,
    credentials: 'include',
  })
}


