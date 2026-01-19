<script setup lang="ts">
try {
	await useAuthStore().initSession()
} catch (error) {
	console.error('Session initialization failed:', error)
}
</script>

<template>
	<NuxtLayout>
		<UApp>
			<NuxtPage />
		</UApp>
	</NuxtLayout>
</template>

