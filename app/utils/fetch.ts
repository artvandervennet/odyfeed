import type { AuthSession } from '~/types/oidc'

export const apiHeaders = {
	'Accept': 'application/activity+json, application/ld+json',
	'Cache-Control': 'no-cache',
}

export const createAuthHeaders = function (session: AuthSession): Record<string, string> {
	return {
		'Authorization': `Bearer ${session.accessToken}`,
		'Content-Type': 'application/ld+json',
		'Accept': 'application/ld+json, application/activity+json',
	}
}

