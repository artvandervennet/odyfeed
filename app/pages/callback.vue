<script setup lang="ts">
const router = useRouter();

onMounted(async () => {
	console.log('[Callback] Redirecting to home...');
	await router.push('/');
});
</script>

<template>
	<div class="min-h-screen flex items-center justify-center">
		<div class="text-center space-y-4">
			<UIcon name="i-heroicons-arrow-path" class="w-12 h-12 animate-spin mx-auto text-primary-500" />
			<p class="text-lg font-medium">Redirecting...</p>
		</div>
	</div>
</template>


