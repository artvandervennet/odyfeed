import type { EnrichedPost, MythActor } from '~~/shared/types/activitypub'


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

export interface LocalUserSession {
  webId: string
  username: string
  actorId: string
  inbox: string
  outbox: string
}

export interface BackendAuthStatus {
  authenticated: boolean
  webId: string | null
  username: string | null
  hasValidToken: boolean
  podUrl: string | null
}

export interface UserData {
  username: string
  actorId: string
}

export interface RegisterUserPayload {
  username: string
  name?: string
  summary?: string
}

export interface RegisterUserResponse {
  username: string
  actorId: string
  inbox: string
  outbox: string
}

export interface UserProfile {
  preferredUsername?: string
  name?: string
  avatar?: string
  summary?: string
}
