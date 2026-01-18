import type { EnrichedPost, MythActor } from '~~/shared/types/activitypub'

export interface PostInteractions {
  isLiked: (post: EnrichedPost) => boolean
  getLikesCount: (post: EnrichedPost) => number
  getRepliesCount: (post: EnrichedPost) => number
  getActorUsername: (post: EnrichedPost) => string
  getPostId: (post: EnrichedPost) => string
}

export interface ActivityPubActions {
  likePost: (post: EnrichedPost) => Promise<void>
  undoLikePost: (post: EnrichedPost) => Promise<void>
  replyToPost: (post: EnrichedPost, content: string) => Promise<void>
}

export interface TimelineState {
  timeline: {
    orderedItems?: EnrichedPost[]
    totalItems?: number
  } | null
  isLoading: boolean
  status: 'idle' | 'pending' | 'success' | 'error'
}

export interface PostCardProps {
  post: EnrichedPost
  showReplies?: boolean
  isDetailView?: boolean
}

export interface ReplyCardProps {
  reply: EnrichedPost
  level?: number
}

export interface ActorInfoProps {
  actor: MythActor
  showTone?: boolean
  clickable?: boolean
}

export interface PostStatsProps {
  likesCount: number
  repliesCount: number
  isLiked: boolean
}

export interface ReplyFormProps {
  placeholder?: string
  disabled?: boolean
}

export interface PostContentProps {
  content: string
  published: string
  showFullDate?: boolean
}

export interface ActorAvatarProps {
  avatarUrl?: string
  username: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

export interface RepliesListProps {
  replies: EnrichedPost[]
  isLoading?: boolean
}

export interface PostDetailProps {
  post: EnrichedPost
}

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
