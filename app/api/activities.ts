import type { ASActivity, EnrichedPost, ASNote } from '~~/shared/types/activitypub'
import { NAMESPACES, ACTIVITY_TYPES } from '~~/shared/constants'

export const sendActivityToOutbox = async function (
	outboxUrl: string,
	activity: ASActivity
): Promise<void> {
	await $fetch(outboxUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/ld+json',
		},
		body: activity,
	})
}

export const createLikeActivity = function (
	actorId: string,
	outboxUrl: string,
	post: EnrichedPost
): ASActivity {
	return {
		'@context': NAMESPACES.ACTIVITYSTREAMS,
		type: ACTIVITY_TYPES.LIKE,
		id: `${outboxUrl}/${Date.now()}-like`,
		actor: actorId,
		object: post.id,
		to: [post.actor?.id || ''],
	} as ASActivity
}

export const createUndoLikeActivity = function (
	actorId: string,
	outboxUrl: string,
	post: EnrichedPost
): ASActivity {
	const timestamp = Date.now()
	return {
		'@context': NAMESPACES.ACTIVITYSTREAMS,
		type: ACTIVITY_TYPES.UNDO,
		id: `${outboxUrl}/${timestamp}-undo`,
		actor: actorId,
		object: {
			id: `${outboxUrl}/${timestamp}-like`,
			type: ACTIVITY_TYPES.LIKE,
			actor: actorId,
			object: post.id,
		},
		to: [post.actor?.id || ''],
	} as ASActivity
}

export const createReplyActivity = function (
	actorId: string,
	outboxUrl: string,
	post: EnrichedPost,
	content: string
): { replyNote: ASNote; createActivity: ASActivity } {
	const replyUuid = crypto.randomUUID()
	const createUuid = crypto.randomUUID()

	const username = actorId.split('/').slice(-1)[0]
	const baseUrl = actorId.split('/api/actors/')[0]
	const replyId = `${baseUrl}/api/actors/${username}/status/${replyUuid}`

	const replyNote: ASNote = {
		'@context': NAMESPACES.ACTIVITYSTREAMS,
		type: ACTIVITY_TYPES.NOTE,
		id: replyId,
		attributedTo: actorId,
		content,
		inReplyTo: post.id,
		to: [NAMESPACES.PUBLIC, post.actor?.id || ''],
		published: new Date().toISOString(),
	} as ASNote

	const createActivity: ASActivity = {
		'@context': NAMESPACES.ACTIVITYSTREAMS,
		type: ACTIVITY_TYPES.CREATE,
		id: `${outboxUrl}/${createUuid}`,
		actor: actorId,
		object: replyNote,
		to: [NAMESPACES.PUBLIC, post.actor?.id || ''],
		published: replyNote.published,
	} as ASActivity

	return { replyNote, createActivity }
}

export const sendLikeActivity = async function (
	targetInbox: string,
	userOutbox: string,
	activity: ASActivity
): Promise<void> {
	await sendActivityToOutbox(userOutbox, activity)
}

export const sendUndoActivity = async function (
	targetInbox: string,
	userOutbox: string,
	activity: ASActivity
): Promise<void> {
	await sendActivityToOutbox(userOutbox, activity)
}

export const sendReplyActivity = async function (
	targetInbox: string,
	userOutbox: string,
	activity: ASActivity
): Promise<void> {
	await sendActivityToOutbox(userOutbox, activity)
}

