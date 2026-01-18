import { ref } from 'vue'

interface AuthStatusResponse {
	authenticated: boolean
	webId: string | null
	username: string | null
	hasValidToken: boolean
	podUrl: string | null
}

export const useBackendAuth = function () {
	const isLoggedIn = ref(false)
	const webId = ref('')
	const username = ref('')
	const hasValidToken = ref(false)
	const podUrl = ref('')
	const isLoading = ref(false)

	const checkAuthStatus = async function (): Promise<void> {
		try {
			const response = await $fetch<AuthStatusResponse>('/api/auth/status')
			isLoggedIn.value = response.authenticated
			webId.value = response.webId || ''
			username.value = response.username || ''
			hasValidToken.value = response.hasValidToken || false
			podUrl.value = response.podUrl || ''
		} catch (error) {
			isLoggedIn.value = false
			webId.value = ''
			username.value = ''
			hasValidToken.value = false
			podUrl.value = ''
		}
	}

	const login = async function (issuer: string): Promise<void> {
		isLoading.value = true
		// Redirect to backend login endpoint
		window.location.href = `/api/auth/login?issuer=${encodeURIComponent(issuer)}`
	}

	const logout = async function (): Promise<void> {
		await $fetch('/api/auth/logout', { method: 'POST' })
		isLoggedIn.value = false
		webId.value = ''
		username.value = ''
		hasValidToken.value = false
		podUrl.value = ''
		window.location.href = '/'
	}

	return {
		isLoggedIn,
		webId,
		username,
		hasValidToken,
		podUrl,
		isLoading,
		checkAuthStatus,
		login,
		logout,
	}
}
