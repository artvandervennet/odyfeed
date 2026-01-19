import { useAuthStore } from '~/stores/authStore'
import type { RegisterUserRequest } from '~~/shared/types/api'

export const useAuth = function () {
	const authStore = useAuthStore()

	const isAuthenticated = computed(() => authStore.isAuthenticated)
	const isLoggedIn = computed(() => authStore.isLoggedIn)
	const needsRegistration = computed(() => authStore.isAuthenticated && !authStore.isLoggedIn)
	const userProfile = computed(() => authStore.userProfile)
	const actorId = computed(() => authStore.actorId)
	const webId = computed(() => authStore.webId)
	const username = computed(() => authStore.username)
	const inbox = computed(() => authStore.inbox)
	const outbox = computed(() => authStore.outbox)

	const login = async function (issuer: string): Promise<void> {
		await authStore.login(issuer)
	}

	const logout = async function (): Promise<void> {
		await authStore.logout()
		if (typeof window !== 'undefined') {
			window.location.href = '/'
		}
	}

	const registerUser = async function (
		username: string,
		profile?: { name?: string; summary?: string }
	): Promise<void> {
		await authStore.registerUser(username, profile)
	}

	return {
		isAuthenticated,
		isLoggedIn,
		needsRegistration,
		userProfile,
		actorId,
		webId,
		username,
		inbox,
		outbox,
		login,
		logout,
		registerUser,
	}
}
