<script setup lang="ts">
const auth = useAuthStore();
const router = useRouter();

onMounted(async () => {
  try {
    await auth.initSession();
    await router.push('/');
  } catch (error) {
    console.error('Callback handling failed:', error);
    await router.push('/');
  }
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center space-y-4">
      <UIcon name="i-heroicons-arrow-path" class="w-12 h-12 animate-spin mx-auto text-primary-500" />
      <p class="text-lg font-medium">Completing login...</p>
    </div>
  </div>
</template>
