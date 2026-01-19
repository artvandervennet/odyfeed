export default defineNuxtPlugin({
	name: 'auth-session',
	async setup() {
		const authStore = useAuthStore()

		try {
			await authStore.initSession()
		} catch (error) {
			console.error('[Plugin] Session initialization failed:', error)
		}
	},
})
