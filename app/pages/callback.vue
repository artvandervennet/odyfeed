<script setup lang="ts">
import {useAuthStore} from '~/stores/authStore'

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
  <div class="band callback" data-paint="deep">
    <div class="inner">
      <p v-if="!error" class="lead" role="status">Completing authentication...</p>
      <template v-else>
        <p class="lead" role="alert">{{ error }}</p>
        <p>Redirecting to home...</p>
      </template>
    </div>
  </div>
</template>
