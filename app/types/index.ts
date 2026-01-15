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

