import type { AuthSession } from '~/types/oidc'
import type { ASActivity } from '~~/shared/types/activitypub'
import { createAuthHeaders } from '~/utils/fetch'

export const sendActivityToOutbox = async function (
	session: AuthSession,
	outboxUrl: string,
	activity: ASActivity
): Promise<void> {
	console.log('[API] Sending activity to outbox:', outboxUrl)
	await $fetch(outboxUrl, {
		method: 'POST',
		headers: createAuthHeaders(session),
		body: activity,
	})
	console.log('[API] Activity sent to outbox successfully')
}

export const sendLikeActivity = async function (
	session: AuthSession,
	targetInbox: string,
	userOutbox: string,
	activity: ASActivity
): Promise<void> {
	console.log('[API] Sending like activity via outbox')
	console.log('[API] Activity:', activity)
	console.log('[API] Target inbox (for reference):', targetInbox)

	await sendActivityToOutbox(session, userOutbox, activity)
	console.log('[API] Like activity posted to outbox - ActivityPods will deliver to inbox')
}

export const sendUndoActivity = async function (
	session: AuthSession,
	targetInbox: string,
	userOutbox: string,
	activity: ASActivity
): Promise<void> {
	console.log('[API] Sending undo activity via outbox')
	console.log('[API] Activity:', activity)
	console.log('[API] Target inbox (for reference):', targetInbox)

	await sendActivityToOutbox(session, userOutbox, activity)
	console.log('[API] Undo activity posted to outbox - ActivityPods will deliver to inbox')
}

export const sendReplyActivity = async function (
	session: AuthSession,
	targetInbox: string,
	userOutbox: string,
	activity: ASActivity
): Promise<void> {
	console.log('[API] Sending reply activity via outbox')
	console.log('[API] Activity:', activity)
	console.log('[API] Target inbox (for reference):', targetInbox)

	await sendActivityToOutbox(session, userOutbox, activity)
	console.log('[API] Reply activity posted to outbox - ActivityPods will deliver to inbox')
}

