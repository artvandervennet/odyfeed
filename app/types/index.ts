export type {
  AuthStatusResponse as BackendAuthStatus,
  UserDataResponse as UserData,
  RegisterUserRequest as RegisterUserPayload,
  RegisterUserResponse,
  UserSessionData as LocalUserSession,
  UserProfileResponse as UserProfile,
} from '~~/shared/types/api'

export type { EnrichedPost, MythActor } from '~~/shared/types/activitypub'

export interface WebIdMapping {
  webId: string
  username: string
  actorId: string
  createdAt: string
  podStorageUrl?: string
}

export interface UserRegistration {
  webId: string
  username: string
  name?: string
  avatar?: string
  summary?: string
}

