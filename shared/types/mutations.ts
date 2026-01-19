import type { EnrichedPost } from './activitypub'
import type { TimelineResponse } from './api'

export interface MutationContext<T = unknown> {
  previousData?: T
}

export interface TimelineMutationContext extends MutationContext<TimelineResponse> {
  previousTimeline?: TimelineResponse
}

export interface LikeMutationPayload {
  post: EnrichedPost
  isUndo?: boolean
}

export interface ReplyMutationPayload {
  post: EnrichedPost
  content: string
}

export interface WebmentionMutationPayload {
  source: string
  target: string
  postId?: string
}

export interface OptimisticUpdateConfig<TData, TPayload> {
  getQueryKey: (payload: TPayload) => readonly unknown[]
  updateCache: (currentData: TData | undefined, payload: TPayload, actorId: string) => TData
  rollbackOnError?: boolean
}
