import type { CreatePayload, ResourceIdentifier, WithOptional } from './base'
import type { ASActor, ASNote, EnrichedPost, ASCollection } from './activitypub'
import type { Webmention } from './webmention'

export interface AuthStatusResponse {
  authenticated: boolean
  webId: string | null
  username: string | null
  hasValidToken: boolean
  podUrl: string | null
}

export interface UserDataResponse {
  username: string
  actorId: string
}

export interface RegisterUserRequest {
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

export interface UserSessionData extends ResourceIdentifier {
  webId: string
  username: string
  actorId: string
  inbox: string
  outbox: string
}

export interface UserProfileResponse {
  preferredUsername?: string
  name?: string
  avatar?: string
  summary?: string
}

export interface TimelineResponse {
  orderedItems: EnrichedPost[]
  totalItems: number
  groupedByEvent?: Array<{
    event: {
      id: string
      title: string
      description: string
      sequence: number
      published: string
    }
    posts: EnrichedPost[]
  }>
}

export interface InboxResponse {
  activities: ASCollection<string | unknown>
}

export interface WebmentionCollectionResponse {
  total: number
  items: Webmention[]
}

export interface ActivityRequest {
  actorId: string
  outbox: string
  targetInbox: string
}

export interface LikeActivityPayload extends ActivityRequest {
  postId: string
}

export interface ReplyActivityPayload extends ActivityRequest {
  postId: string
  content: string
}

export interface WebmentionPayload {
  source: string
  target: string
  type: 'like' | 'comment' | 'mention' | 'repost'
}

export type LoginRequest = {
  issuer: string
}

export type LogoutResponse = {
  success: boolean
}
