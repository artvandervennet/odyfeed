import { useAuthStore } from '~/stores/authStore'
import type { useQueryCache } from '@pinia/colada'
import type { MutationContext } from '~~/shared/types/mutations'

type QueryCache = ReturnType<typeof useQueryCache>

export interface AuthValidation {
	actorId: string
	outbox: string
	inbox?: string
}

export const validateAuth = function (): AuthValidation {
	const auth = useAuthStore()

	if (!auth.isLoggedIn || !auth.actorId || !auth.outbox) {
		throw new Error('Not authenticated')
	}

	return {
		actorId: auth.actorId,
		outbox: auth.outbox,
		inbox: auth.inbox,
	}
}

export const handlePodStorageError = function (error: unknown, action: string): void {
	console.warn(`Failed to ${action} to Pod:`, error)
}

export interface OptimisticMutationConfig<TData, TPayload, TContext extends MutationContext = MutationContext> {
	queryKey: readonly unknown[]
	updateCacheFn: (currentData: TData | undefined, payload: TPayload, actorId: string) => TData
	rollbackOnError?: boolean
}

export const createOptimisticUpdateHandlers = function <
	TData,
	TPayload,
	TContext extends MutationContext = MutationContext
>(
	queryCache: QueryCache,
	config: OptimisticMutationConfig<TData, TPayload, TContext>
) {
	return {
		onMutate: async (payload: TPayload): Promise<TContext> => {
			const { actorId } = validateAuth()

			await queryCache.cancelQueries({ key: config.queryKey as any })

			const previousData = queryCache.getQueryData<TData>(config.queryKey as any)

			if (previousData) {
				const updatedData = config.updateCacheFn(previousData, payload, actorId)
				queryCache.setQueryData(config.queryKey as any, updatedData)
			}

			return { previousData } as TContext
		},

		onError: (_error: Error, _payload: TPayload, context: TContext | undefined) => {
			if (config.rollbackOnError !== false && context?.previousData) {
				queryCache.setQueryData(config.queryKey as any, context.previousData)
			}
		},

		onSuccess: async () => {
			await queryCache.invalidateQueries({ key: config.queryKey as any })
		},
	}
}

export const updateTimelineWithLike = function <T extends { id: string; likes?: { totalItems?: number; orderedItems?: string[] } }>(
	items: T[],
	postId: string,
	actorId: string,
	isUndo: boolean = false
): T[] {
	return items.map(item =>
		item.id === postId
			? {
					...item,
					likes: {
						...item.likes,
						totalItems: Math.max((item.likes?.totalItems || 0) + (isUndo ? -1 : 1), 0),
						orderedItems: isUndo
							? (item.likes?.orderedItems || []).filter(id => id !== actorId)
							: [...(item.likes?.orderedItems || []), actorId]
					}
				}
			: item
	)
}

export const updateTimelineWithReply = function <T extends { id: string; replies?: { totalItems?: number; orderedItems?: string[] } }>(
	items: T[],
	postId: string,
	replyId: string
): T[] {
	return items.map(item =>
		item.id === postId
			? {
					...item,
					replies: {
						...item.replies,
						totalItems: (item.replies?.totalItems || 0) + 1,
						orderedItems: [...(item.replies?.orderedItems || []), replyId]
					}
				}
			: item
	)
}

