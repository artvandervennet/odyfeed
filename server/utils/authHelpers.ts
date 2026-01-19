import type { H3Event } from 'h3'
import { NAMESPACES } from '~~/shared/constants'
import type { ASNote, ASActivity } from '~~/shared/types/activitypub'

export const isPublicNote = function (toArray: string[], ccArray?: string[]): boolean {
	const allRecipients = [...toArray, ...(ccArray || [])]
	return allRecipients.includes(NAMESPACES.PUBLIC)
}

export const isAuthorizedToView = function (
	toArray: string[],
	ccArray: string[] | undefined,
	requestingWebId?: string
): boolean {
	if (!requestingWebId) {
		return false
	}

	const allRecipients = [...toArray, ...(ccArray || [])]
	return allRecipients.includes(requestingWebId)
}

export const requireAuth = function (event: H3Event): { webId: string; username: string } {
	const auth = event.context.auth

	if (!auth || !auth.webId) {
		throw createError({
			statusCode: 401,
			statusMessage: 'Authentication required',
		})
	}

	return {
		webId: auth.webId,
		username: auth.username,
	}
}

export const optionalAuth = function (event: H3Event): { webId: string; username: string } | null {
	const auth = event.context.auth
	if (!auth || !auth.webId) {
		return null
	}
	return {
		webId: auth.webId,
		username: auth.username,
	}
}

export const getAuthenticatedWebId = function (event: H3Event): string | undefined {
	return event.context.auth?.webId
}

export const extractNoteFromActivity = function (activity: ASActivity): ASNote | ASActivity {
	if (activity.type === 'Create' && typeof activity.object === 'object') {
		return activity.object as ASNote
	}

	if (activity.type === 'Note') {
		return activity as unknown as ASNote
	}

	return activity
}

export const checkNoteAuthorization = function (
	note: ASNote,
	requestingWebId?: string
): { isPublic: boolean; isAuthorized: boolean } {
	if (!note.to) {
		return { isPublic: false, isAuthorized: false }
	}

	const isPublic = isPublicNote(note.to, note.cc)

	if (isPublic) {
		return { isPublic: true, isAuthorized: true }
	}

	const isAuthorized = requestingWebId ? isAuthorizedToView(note.to, note.cc, requestingWebId) : false

	return { isPublic: false, isAuthorized }
}

export const validateStringField = function (value: unknown, fieldName: string, required = false): string {
	if (required && (!value || typeof value !== 'string')) {
		throw createError({
			statusCode: 400,
			statusMessage: `${fieldName} is required and must be a string`,
		})
	}
	if (value && typeof value !== 'string') {
		throw createError({
			statusCode: 400,
			statusMessage: `${fieldName} must be a string`,
		})
	}
	return value as string
}

