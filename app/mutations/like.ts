import {defineMutation, useMutation, useQueryCache} from '@pinia/colada'
import {useAuthStore} from '~/stores/authStore'
import {sendLikeActivity, sendUndoActivity} from '~/api/activities'
import type {EnrichedPost} from '~~/shared/types/activitypub'
import {NAMESPACES, ACTIVITY_TYPES} from '~~/shared/constants'

export const useLikeMutation = defineMutation(() => {
	const auth = useAuthStore()
	const queryCache = useQueryCache()

	return useMutation({
		onMutate: async (post: EnrichedPost) => {
			console.log('[useLikeMutation] Starting like mutation for post:', post.id)

			if (!auth.session || !auth.webId) {
				console.error('[useLikeMutation] Not authenticated')
				throw new Error('Not authenticated')
			}

			if (!auth.inbox || !auth.outbox) {
				console.error('[useLikeMutation] Inbox or outbox not configured')
				throw new Error('Inbox or outbox not configured')
			}

			if (!post.actor?.inbox) {
				console.error('[useLikeMutation] Target actor inbox not found')
				throw new Error('Target actor inbox not found')
			}

			await queryCache.cancelQueries({key: ['timeline']})
			await queryCache.cancelQueries({key: ['post']})

			const previousTimeline = queryCache.getQueryData(['timeline'])
			const previousPost = queryCache.getQueryData(['post', post.actor.preferredUsername, post.id.split('/').pop() || ''])

			console.log('[useLikeMutation] Setting optimistic like state')

			return {previousTimeline, previousPost}
		},
		mutation: async (post: EnrichedPost) => {
			console.log('[useLikeMutation] Executing mutation')

			if (!auth.session || !auth.webId || !auth.outbox) {
				throw new Error('Not authenticated')
			}

			if (!post.actor?.inbox) {
				throw new Error('Target actor inbox not found')
			}

			const likeActivity = {
				'@context': NAMESPACES.ACTIVITYSTREAMS,
				type: ACTIVITY_TYPES.LIKE,
				id: `${auth.outbox}/${Date.now()}-like`,
				actor: auth.webId,
				object: post.id,
				to: [post.actor.id],
			}

			console.log('[useLikeMutation] Sending like activity:', likeActivity)

			await sendLikeActivity(
				auth.session,
				post.actor.inbox,
				auth.outbox,
				likeActivity,
			)

			console.log('[useLikeMutation] Like activity sent successfully')
			return likeActivity
		},
		onSuccess: async () => {
			console.log('[useLikeMutation] Invalidating queries')
			await queryCache.invalidateQueries({key: ['timeline']})
			await queryCache.invalidateQueries({key: ['post']})
			await queryCache.invalidateQueries({key: ['actor-posts']})
		},
		onError: (error, post, context) => {
			console.error('[useLikeMutation] Failed to like post:', error)

			if (context?.previousTimeline) {
				queryCache.setQueryData(['timeline'], context.previousTimeline)
			}
			if (context?.previousPost) {
				const postId = post.id.split('/').pop()
				queryCache.setQueryData(['post', post.actor?.preferredUsername || '', postId || ''], context.previousPost)
			}
		},
	})
})

export const useUndoLikeMutation = defineMutation(() => {
	const auth = useAuthStore()
	const queryCache = useQueryCache()

	return useMutation({
		onMutate: async (post: EnrichedPost) => {
			console.log('[useUndoLikeMutation] Starting undo like mutation for post:', post.id)

			if (!auth.session || !auth.webId) {
				console.error('[useUndoLikeMutation] Not authenticated')
				throw new Error('Not authenticated')
			}

			if (!auth.inbox || !auth.outbox) {
				console.error('[useUndoLikeMutation] Inbox or outbox not configured')
				throw new Error('Inbox or outbox not configured')
			}

			if (!post.actor?.inbox) {
				console.error('[useUndoLikeMutation] Target actor inbox not found')
				throw new Error('Target actor inbox not found')
			}

			await queryCache.cancelQueries({key: ['timeline']})
			await queryCache.cancelQueries({key: ['post']})

			const previousTimeline = queryCache.getQueryData(['timeline'])
			const previousPost = queryCache.getQueryData(['post', post.actor.preferredUsername, post.id.split('/').pop() || ''])

			console.log('[useUndoLikeMutation] Setting optimistic unlike state')

			return {previousTimeline, previousPost}
		},
		mutation: async (post: EnrichedPost) => {
			console.log('[useUndoLikeMutation] Executing mutation')

			if (!auth.session || !auth.webId || !auth.outbox) {
				throw new Error('Not authenticated')
			}

			if (!post.actor?.inbox) {
				throw new Error('Target actor inbox not found')
			}

		const timestamp = Date.now()
		const undoActivity = {
			'@context': NAMESPACES.ACTIVITYSTREAMS,
			type: ACTIVITY_TYPES.UNDO,
			id: `${auth.outbox}/${timestamp}-undo`,
			actor: auth.webId,
			object: {
				type: ACTIVITY_TYPES.LIKE,
				id: `${auth.outbox}/${timestamp}-like`,
				actor: auth.webId,
				object: post.id,
			},
			to: [post.actor.id],
		}

			console.log('[useUndoLikeMutation] Sending undo activity:', undoActivity)

			await sendUndoActivity(
				auth.session,
				post.actor.inbox,
				auth.outbox,
				undoActivity,
			)

			console.log('[useUndoLikeMutation] Undo activity sent successfully')
			return undoActivity
		},
		onSuccess: async () => {
			console.log('[useUndoLikeMutation] Invalidating queries')
			await queryCache.invalidateQueries({key: ['timeline']})
			await queryCache.invalidateQueries({key: ['post']})
			await queryCache.invalidateQueries({key: ['actor-posts']})
		},
		onError: (error, _post, context) => {
			console.error('[useUndoLikeMutation] Failed to undo like:', error)

			if (context?.previousTimeline) {
				queryCache.setQueryData(['timeline'], context.previousTimeline)
			}
			if (context?.previousPost) {
				const postId = _post.id.split('/').pop()
				queryCache.setQueryData(['post', _post.actor?.preferredUsername || '', postId || ''], context.previousPost)
			}
		},
	})
})

