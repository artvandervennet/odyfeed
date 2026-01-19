import { useAuthStore } from '~/stores/authStore'

export interface AuthValidation {
	actorId: string
	outbox: string
}

export const validateAuth = function (): AuthValidation {
	const auth = useAuthStore()

	if (!auth.isLoggedIn || !auth.actorId || !auth.outbox) {
		throw new Error('Not authenticated')
	}

	return {
		actorId: auth.actorId,
		outbox: auth.outbox,
	}
}

export const handlePodStorageError = function (error: unknown, action: string): void {
	console.warn(`Failed to ${action} to Pod:`, error)
}
