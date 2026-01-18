import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useSolidAuth } from '~/composables/useSolidAuth'
import type { LocalUserSession } from '~/types'
import { ENDPOINT_PATHS } from '~~/shared/constants'

interface BackendAuthStatus {
	authenticated: boolean
	webId: string | null
	username: string | null
	hasValidToken: boolean
	podUrl: string | null
}

export const useAuthStore = defineStore('auth', () => {
	const solidAuth = useSolidAuth()
	const localUser = ref<LocalUserSession | null>(null)
	const isLoggedIn = computed<boolean>(() => !!localUser.value?.username)
	const webId = computed<string>(() => localUser.value?.webId || solidAuth.webId.value)
	const username = computed<string>(() => localUser.value?.username || '')
	const actorId = computed<string>(() => localUser.value?.actorId || '')
	const outbox = computed<string>(() => localUser.value?.outbox || '')
	const inbox = computed<string>(() => localUser.value?.inbox || '')

	const userProfile = ref<{
		preferredUsername?: string
		name?: string
		avatar?: string
		summary?: string
	}>({})

	const loadLocalUserSession = async function (): Promise<void> {
		if (!solidAuth.webId.value) {
			throw new Error('No WebID found')
		}

		try {
			const baseUrl = window.location.origin
			const response = await $fetch(`${ENDPOINT_PATHS.API_USERS_ME}?webId=${encodeURIComponent(solidAuth.webId.value)}`)

			if (response && typeof response === 'object' && 'username' in response) {
				const userData = response as { username: string; actorId: string }
				localUser.value = {
					webId: solidAuth.webId.value,
					username: userData.username,
					actorId: userData.actorId,
					inbox: `${baseUrl}${ENDPOINT_PATHS.ACTORS_INBOX(userData.username)}`,
					outbox: `${baseUrl}${ENDPOINT_PATHS.ACTORS_OUTBOX(userData.username)}`,
				}

				await loadUserProfile()
				console.log('[Auth] Local user session loaded:', localUser.value)
			}
		} catch (error: any) {
			if (error.statusCode === 404) {
				console.log('[Auth] User not registered locally, needs registration')
				localUser.value = null
			} else {
				console.error('[Auth] Failed to load local user session:', error)
				throw error
			}
		}
	}

	const loadUserProfile = async function (): Promise<void> {
		if (!localUser.value) return

		try {
			const response = await $fetch(`/api/actors/${localUser.value.username}`)
			if (response && typeof response === 'object') {
				const actor = response as any
				userProfile.value = {
					preferredUsername: actor.preferredUsername,
					name: actor.name,
					avatar: actor.icon?.url || actor.icon,
					summary: actor.summary,
				}
			}
		} catch (error) {
			console.error('[Auth] Failed to load user profile:', error)
		}
	}

	const registerUser = async function (username: string, profile?: { name?: string; avatar?: string; summary?: string }): Promise<void> {
		// Check backend auth status first (for backend OAuth flow)
		let webIdToUse = ''

		try {
			const backendStatus = await $fetch<BackendAuthStatus>('/api/auth/status')
			if (backendStatus.authenticated && backendStatus.webId) {
				webIdToUse = backendStatus.webId
				console.log('[Auth] Using WebID from backend session:', webIdToUse)
			}
		} catch (error) {
			console.warn('[Auth] Failed to get backend auth status, trying frontend session:', error)
		}

		// Fallback to frontend Solid auth
		if (!webIdToUse && solidAuth.webId.value) {
			webIdToUse = solidAuth.webId.value
			console.log('[Auth] Using WebID from frontend session:', webIdToUse)
		}

		if (!webIdToUse) {
			throw new Error('No WebID found - please login first')
		}

		console.log('[Auth] Registering user:', {
			webId: webIdToUse,
			username,
		})

		// Backend already has tokens from OAuth flow - just send username and profile
		const response = await $fetch(ENDPOINT_PATHS.API_USERS_REGISTER, {
			method: 'POST',
			body: {
				username,
				name: profile?.name,
				summary: profile?.summary,
			},
			credentials: 'include', // Important: send session cookie
		})

		if (response && typeof response === 'object' && 'username' in response) {
			const userData = response as { username: string; actorId: string; inbox: string; outbox: string }
			localUser.value = {
				webId: webIdToUse,
				username: userData.username,
				actorId: userData.actorId,
				inbox: userData.inbox,
				outbox: userData.outbox,
			}

			await loadUserProfile()
			console.log('[Auth] User registered:', localUser.value)
		}
	}

	const initSession = async function (): Promise<void> {
		console.log('[Auth] Initializing session...')

		// Check if we have a backend session (from backend OAuth)
		try {
			const backendStatus = await $fetch<BackendAuthStatus>('/api/auth/status')
			if (backendStatus.authenticated && backendStatus.webId) {
				console.log('[Auth] Backend session found:', backendStatus)

				// Try to load local user session
				try {
					const baseUrl = window.location.origin
					const response = await $fetch(`${ENDPOINT_PATHS.API_USERS_ME}?webId=${encodeURIComponent(backendStatus.webId)}`)

					if (response && typeof response === 'object' && 'username' in response) {
						const userData = response as { username: string; actorId: string }
						localUser.value = {
							webId: backendStatus.webId,
							username: userData.username,
							actorId: userData.actorId,
							inbox: `${baseUrl}${ENDPOINT_PATHS.ACTORS_INBOX(userData.username)}`,
							outbox: `${baseUrl}${ENDPOINT_PATHS.ACTORS_OUTBOX(userData.username)}`,
						}

						// Also sync with frontend Solid auth if needed
						if (solidAuth.webId.value !== backendStatus.webId) {
							// Try to restore frontend session
							await solidAuth.handleRedirect()
						}

						await loadUserProfile()
						console.log('[Auth] Session fully initialized from backend')
						return
					}
				} catch (error: any) {
					if (error.statusCode === 404) {
						console.log('[Auth] User not registered locally, needs registration')
						localUser.value = null
					} else {
						console.error('[Auth] Failed to load local user session:', error)
					}
				}
			}
		} catch (error) {
			console.log('[Auth] No backend session found, checking frontend session...')
		}

		// Fallback to frontend OAuth session check
		await solidAuth.handleRedirect()

		console.log('[Auth] After handleRedirect, isLoggedIn:', solidAuth.isLoggedIn.value)
		console.log('[Auth] WebID:', solidAuth.webId.value)

		if (solidAuth.isLoggedIn.value && solidAuth.webId.value) {
			try {
				await loadLocalUserSession()
				console.log('[Auth] Session fully initialized')
			} catch (error) {
				console.warn('[Auth] Failed to load local user session:', error)
			}
		} else {
			console.log('[Auth] Not logged in after redirect handling')
		}
	}

	const startLogin = async function (issuer: string): Promise<void> {
		// Use backend OAuth flow instead of frontend OAuth
		console.log('[Auth] Starting backend OAuth flow with issuer:', issuer)
		window.location.href = `/api/auth/login?issuer=${encodeURIComponent(issuer)}`
	}

	const startLogout = async function (): Promise<void> {
		try {
			await $fetch('/api/auth/logout', { method: 'POST' })
		} catch (error) {
			// Logout error - continue anyway
		}

		// Also clear frontend Solid session
		await solidAuth.solidLogout()
		localUser.value = null
		userProfile.value = {}

		// Redirect to home
		window.location.href = '/'
	}

	return {
		isLoggedIn,
		webId,
		username,
		actorId,
		outbox,
		inbox,
		userProfile,
		localUser,
		solidSession: solidAuth.session,
		login: startLogin,
		logout: startLogout,
		initSession,
		loadLocalUserSession,
		registerUser,
	}
})

