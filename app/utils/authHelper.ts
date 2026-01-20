import { useAuthStore } from '~/stores/authStore'

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
