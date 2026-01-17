import { defineMutation, useMutation, useQueryCache } from '@pinia/colada'
import { useAuthStore } from '~/stores/authStore'
import { sendReplyActivity } from '~/api/activities'
import type { EnrichedPost } from '~~/shared/types/activitypub'
import { NAMESPACES, ACTIVITY_TYPES } from '~~/shared/constants'
import { useActivityPodsAuth } from '~/composables/useActivityPodsAuth'

const ensureValidToken = async function (auth: ReturnType<typeof useAuthStore>) {
	if (!auth.session) {
		throw new Error('Not authenticated')
	}

	const tokenExpiresIn = auth.session.expiresAt - Date.now()
	console.log('[Token Check] Token expires in:', Math.floor(tokenExpiresIn / 1000), 'seconds')

	if (tokenExpiresIn < 60000) {
		console.log('[Token Check] Token expiring soon, refreshing...')
		const {refreshSession} = useActivityPodsAuth()
		const newSession = await refreshSession(auth.session)

		if (newSession) {
			auth.session = newSession
			console.log('[Token Check] Token refreshed successfully')
		} else {
			console.error('[Token Check] Token refresh failed')
			throw new Error('Token expired and refresh failed. Please login again.')
		}
	}
}

export const useReplyMutation = defineMutation(() => {
	const auth = useAuthStore()
	const queryCache = useQueryCache()

	return useMutation({
		onMutate: async ({ post, content }: { post: EnrichedPost; content: string }) => {
			console.log('[useReplyMutation] Starting reply mutation for post:', post.id)

			if (!auth.session || !auth.webId) {
				console.error('[useReplyMutation] Not authenticated')
				throw new Error('Not authenticated')
			}

			if (!auth.inbox || !auth.outbox) {
				console.error('[useReplyMutation] Inbox or outbox not configured')
				throw new Error('Inbox or outbox not configured')
			}

			if (!post.actor?.inbox) {
				console.error('[useReplyMutation] Target actor inbox not found')
				throw new Error('Target actor inbox not found')
			}

			if (!content.trim()) {
				console.error('[useReplyMutation] Reply content cannot be empty')
				throw new Error('Reply content cannot be empty')
			}

			await queryCache.cancelQueries({ key: ['replies', post.id] })
			await queryCache.cancelQueries({ key: ['timeline'] })

			const previousReplies = queryCache.getQueryData(['replies', post.id])
			const previousTimeline = queryCache.getQueryData(['timeline'])

			console.log('[useReplyMutation] Setting optimistic reply state')

			return { previousReplies, previousTimeline }
		},
		mutation: async ({ post, content }: { post: EnrichedPost; content: string }) => {
			console.log('[useReplyMutation] Executing mutation')

			await ensureValidToken(auth)

			if (!auth.session || !auth.webId || !auth.outbox) {
				throw new Error('Not authenticated')
			}

			if (!post.actor?.inbox) {
				throw new Error('Target actor inbox not found')
			}

			const timestamp = Date.now()
			const replyId = `${auth.outbox}/${timestamp}-reply`

			const replyNote = {
				'@context': NAMESPACES.ACTIVITYSTREAMS,
				type: ACTIVITY_TYPES.NOTE,
				id: replyId,
				attributedTo: auth.webId,
				content: content.trim(),
				inReplyTo: post.id,
				to: [NAMESPACES.PUBLIC, post.actor.id],
				published: new Date().toISOString(),
			}

			const createActivity = {
				'@context': NAMESPACES.ACTIVITYSTREAMS,
				type: ACTIVITY_TYPES.CREATE,
				id: `${auth.outbox}/${timestamp}-create`,
				actor: auth.webId,
				object: replyNote,
				to: [NAMESPACES.PUBLIC, post.actor.id],
				published: replyNote.published,
			}

			console.log('[useReplyMutation] Sending reply activity:', createActivity)

			await sendReplyActivity(
				auth.session,
				post.actor.inbox,
				auth.outbox,
				createActivity
			)

			console.log('[useReplyMutation] Reply activity sent successfully')
			return { replyNote, createActivity }
		},
		onSuccess: async () => {
			console.log('[useReplyMutation] Invalidating queries')
			await queryCache.invalidateQueries({ key: ['timeline'] })
			await queryCache.invalidateQueries({ key: ['post'] })
			await queryCache.invalidateQueries({ key: ['replies'] })
			await queryCache.invalidateQueries({ key: ['actor-posts'] })
		},
		onError: (error, { post }, context) => {
			console.error('[useReplyMutation] Failed to post reply:', error)

			if (context?.previousReplies) {
				queryCache.setQueryData(['replies', post.id], context.previousReplies)
			}
			if (context?.previousTimeline) {
				queryCache.setQueryData(['timeline'], context.previousTimeline)
			}
		},
	})
})

