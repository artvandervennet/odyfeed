import type { ASActor, ASActivity } from '~~/shared/types/activitypub'
import { NAMESPACES, ACTIVITY_TYPES, ACTIVITYPUB_CONTEXT } from '~~/shared/constants'
import { signRequest } from './crypto'
import { logInfo, logError, logDebug } from './logger'

export const dereferenceActor = async function (actorId: string): Promise<ASActor | null> {
	try {
		if (actorId === NAMESPACES.PUBLIC) {
			return null
		}

		logDebug(`Dereferencing actor: ${actorId}`)

		const actor = await $fetch<ASActor>(actorId, {
			headers: {
				'Accept': 'application/ld+json, application/activity+json',
			},
		})

		if (actor?.inbox) {
			logDebug(`Successfully dereferenced actor ${actorId}, inbox: ${actor.inbox}`)
			return actor
		}

		logError(`Actor ${actorId} has no inbox`)
		return null
	} catch (error) {
		logError(`Failed to dereference actor ${actorId}`, error)
		return null
	}
}

export const resolveRecipientInboxes = async function (
	to: string[],
	cc?: string[]
): Promise<string[]> {
	const recipients = [...to, ...(cc || [])]
	const uniqueRecipients = [...new Set(recipients)].filter(r => r !== NAMESPACES.PUBLIC)

	const inboxes: string[] = []

	for (const recipientId of uniqueRecipients) {
		const actor = await dereferenceActor(recipientId)
		if (actor?.inbox) {
			inboxes.push(actor.inbox)
		}
	}

	return [...new Set(inboxes)]
}

export const sendActivityToInbox = async function (
	inboxUrl: string,
	activity: ASActivity,
	senderActorId: string,
	privateKey: string
): Promise<boolean> {
	try {
		const body = JSON.stringify(activity)
		const keyId = `${senderActorId}#main-key`

		const headers = signRequest({
			privateKey,
			keyId,
			url: inboxUrl,
			method: 'POST',
			body,
		})

		logInfo(`Sending activity ${activity.type} to inbox: ${inboxUrl}`)

		const response = await fetch(inboxUrl, {
			method: 'POST',
			headers: {
				...headers,
				'Content-Type': 'application/ld+json; profile="https://www.w3.org/ns/activitystreams"',
			},
			body,
		})

		if (response.ok || response.status === 202) {
			logInfo(`✅ Successfully delivered activity to ${inboxUrl}`)
			return true
		} else {
			logError(`Failed to deliver to ${inboxUrl}: ${response.status} ${response.statusText}`)
			return false
		}
	} catch (error) {
		logError(`Error sending activity to ${inboxUrl}`, error)
		return false
	}
}

export const generateAcceptActivity = function (
	followActivity: ASActivity,
	actorId: string,
	actorInbox: string
): ASActivity {
	const timestamp = Date.now()

	return {
		'@context': ACTIVITYPUB_CONTEXT,
		type: ACTIVITY_TYPES.ACCEPT,
		id: `${actorInbox}/${timestamp}-accept`,
		actor: actorId,
		object: followActivity,
	} as ASActivity
}

export const federateActivity = async function (
	activity: ASActivity,
	senderActorId: string,
	privateKey: string
): Promise<{ total: number; successful: number; failed: number }> {
	const activityWithRecipients = activity as ASActivity & { to?: string | string[]; cc?: string | string[] }
	const to = Array.isArray(activityWithRecipients.to)
		? activityWithRecipients.to
		: activityWithRecipients.to
			? [activityWithRecipients.to as string]
			: []
	const cc = Array.isArray(activityWithRecipients.cc)
		? activityWithRecipients.cc
		: activityWithRecipients.cc
			? [activityWithRecipients.cc as string]
			: []

	const inboxes = await resolveRecipientInboxes(to, cc)

	logInfo(`Federating activity to ${inboxes.length} inbox(es)`)

	const results = await Promise.allSettled(
		inboxes.map(inbox => sendActivityToInbox(inbox, activity, senderActorId, privateKey))
	)

	const successful = results.filter(r => r.status === 'fulfilled' && r.value === true).length
	const failed = results.length - successful

	logInfo(`Federation complete: ${successful}/${inboxes.length} successful, ${failed} failed`)

	return {
		total: inboxes.length,
		successful,
		failed,
	}
}
