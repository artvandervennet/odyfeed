<script setup lang="ts">
import { useAuthStore } from '~/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()
const error = ref<string | null>(null)

onMounted(async () => {
	console.log('[Callback] Processing authentication callback...')

	try {
		await authStore.initSession()
		console.log('[Callback] Authentication successful, redirecting to home...')
		await router.push('/')
	} catch (err) {
		console.error('[Callback] Authentication failed:', err)
		error.value = 'Authentication failed. Please try again.'

		setTimeout(() => {
			router.push('/')
		}, 3000)
	}
})
</script>

<template>
	<div class="min-h-screen flex items-center justify-center">
		<div class="text-center space-y-4">
			<template v-if="!error">
				<UIcon name="i-heroicons-arrow-path" class="w-12 h-12 animate-spin mx-auto text-primary-500" />
				<p class="text-lg font-medium">Completing authentication...</p>
			</template>
			<template v-else>
				<UIcon name="i-heroicons-exclamation-circle" class="w-12 h-12 mx-auto text-error-500" />
				<p class="text-lg font-medium text-error-600 dark:text-error-400">{{ error }}</p>
				<p class="text-sm text-gray-500">Redirecting to home...</p>
			</template>
		</div>
	</div>
</template>


