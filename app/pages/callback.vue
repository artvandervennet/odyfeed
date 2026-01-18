<script setup lang="ts">
const auth = useAuthStore();
const solidAuth = useSolidAuth();
const router = useRouter();

onMounted(async () => {
  try {
    console.log('[Callback] Waiting for auth to complete...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (solidAuth.isLoggedIn.value) {
      console.log('[Callback] Solid session established, redirecting to home');
      await router.push('/');
    } else {
      console.log('[Callback] Session not established, waiting longer...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (solidAuth.isLoggedIn.value) {
        console.log('[Callback] Session now established, redirecting');
        await router.push('/');
      } else {
        console.error('[Callback] Session failed to establish');
        await router.push('/');
      }
    }
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
