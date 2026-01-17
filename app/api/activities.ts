import type { AuthSession } from '~/types/oidc'
import type { ASActivity } from '~~/shared/types/activitypub'
import { createAuthHeaders } from '~/utils/fetch'

export const sendActivityToInbox = async function (
	session: AuthSession,
	inboxUrl: string,
	activity: ASActivity
): Promise<void> {
	await $fetch(inboxUrl, {
		method: 'POST',
		headers: createAuthHeaders(session),
		body: activity,
	})
}

export const sendActivityToOutbox = async function (
	session: AuthSession,
	outboxUrl: string,
	activity: ASActivity
): Promise<void> {
	await $fetch(outboxUrl, {
		method: 'POST',
		headers: createAuthHeaders(session),
		body: activity,
	})
}

export const sendLikeActivity = async function (
	session: AuthSession,
	targetInbox: string,
	userOutbox: string,
	activity: ASActivity
): Promise<void> {
	await sendActivityToInbox(session, targetInbox, activity)

	try {
		await sendActivityToOutbox(session, userOutbox, activity)
	} catch (error) {
		console.warn('Failed to post to own outbox, but activity was sent to target:', error)
	}
}

export const sendUndoActivity = async function (
	session: AuthSession,
	targetInbox: string,
	userOutbox: string,
	activity: ASActivity
): Promise<void> {
	await sendActivityToInbox(session, targetInbox, activity)

	try {
		await sendActivityToOutbox(session, userOutbox, activity)
	} catch (error) {
		console.warn('Failed to post to own outbox, but activity was sent to target:', error)
	}
}

export const sendReplyActivity = async function (
	session: AuthSession,
	targetInbox: string,
	userOutbox: string,
	activity: ASActivity
): Promise<void> {
	await sendActivityToInbox(session, targetInbox, activity)

	try {
		await sendActivityToOutbox(session, userOutbox, activity)
	} catch (error) {
		console.warn('Failed to post to own outbox, but activity was sent to target:', error)
	}
}
