<script setup lang="ts">
import {ref, computed, onMounted} from 'vue';
import {useAuthStore} from '~/stores/authStore';

definePageMeta({
  name: 'setup',
})

const auth = useAuthStore();
const router = useRouter();

const showLoginModal = ref(false);
const validationError = ref<string | null>(null);
const isCheckingAuth = ref(true);

const showLoginPrompt = computed(() => {
  if (isCheckingAuth.value) return false;
  return !auth.isLoggedIn && !auth.isAuthenticated;
});

const showSuccessMessage = computed(() => {
  return auth.isLoggedIn && auth.username;
});

onMounted(async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const errorParam = urlParams.get('error');

  if (errorParam) {
    validationError.value = decodeURIComponent(errorParam);
    isCheckingAuth.value = false;
    return;
  }

  console.log('[Setup] Checking authentication status...')

  try {
    await auth.initSession()

    if (auth.isAuthenticated && !auth.isLoggedIn) {
      console.log('[Setup] User authenticated but not registered, redirecting to /register')
      await router.push('/register')
    } else {
      console.log('[Setup] Auth check complete')
    }

    isCheckingAuth.value = false
  } catch (error) {
    console.error('[Setup] Failed to check auth status:', error)
    isCheckingAuth.value = false
  }
});
</script>

<template>
  <div>
    <UContainer>
      <div class="max-w-lg mx-auto py-12">
        <UAlert
            v-if="validationError"
            icon="i-heroicons-exclamation-triangle"
            color="error"
            variant="soft"
            :title="validationError"
            :description="validationError.includes('not supported') ? 'This application requires an ActivityPods provider with ActivityStreams support. Generic Solid Pods are not supported.' : ''"
            class="mb-6"
            :actions="[{
						label: 'Try Again',
						color: 'error',
						variant: 'soft',
						onClick: () => { validationError = null; showLoginModal = true; }
					}]"
        />

        <!-- Loading state -->
        <UCard v-if="isCheckingAuth">
          <div class="text-center py-8">
            <UIcon name="i-heroicons-arrow-path" class="w-12 h-12 mx-auto text-gray-400 mb-4 animate-spin"/>
            <h2 class="text-xl font-semibold mb-2">Checking authentication...</h2>
            <p class="text-gray-500 dark:text-gray-400">
              Please wait while we verify your session.
            </p>
          </div>
        </UCard>

        <!-- Login prompt -->
        <UCard v-else-if="showLoginPrompt">
          <div class="text-center py-8">
            <UIcon name="i-heroicons-lock-closed" class="w-12 h-12 mx-auto text-gray-400 mb-4"/>
            <h2 class="text-xl font-semibold mb-2">Login Required</h2>
            <p class="text-gray-500 dark:text-gray-400 mb-4">
              You need to be logged in to continue.
            </p>
            <div class="flex gap-3 justify-center">
              <UButton to="/" variant="ghost" color="neutral">
                Go Back
              </UButton>
              <UButton icon="i-heroicons-arrow-right-on-rectangle" @click="showLoginModal = true">
                Login with Solid Pod
              </UButton>
            </div>
          </div>
        </UCard>

        <!-- Success - already registered -->
        <UCard v-else-if="showSuccessMessage">
          <div class="text-center py-8">
            <UIcon name="i-heroicons-check-circle" class="w-12 h-12 mx-auto text-green-500 mb-4"/>
            <h2 class="text-xl font-semibold mb-2">You're all set!</h2>
            <p class="text-gray-500 dark:text-gray-400 mb-4">
              Your account is connected and ready to use.
            </p>
            <div class="space-y-2 text-sm text-left mb-6 max-w-sm mx-auto">
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-check" class="w-5 h-5 text-green-500"/>
                <span>Username: <code class="text-xs">{{ auth.username }}</code></span>
              </div>
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-check" class="w-5 h-5 text-green-500"/>
                <span>WebID: <code class="text-xs">{{ auth.webId }}</code></span>
              </div>
              <div v-if="auth.inbox" class="flex items-center gap-2">
                <UIcon name="i-heroicons-check" class="w-5 h-5 text-green-500"/>
                <span>Inbox configured</span>
              </div>
              <div v-if="auth.outbox" class="flex items-center gap-2">
                <UIcon name="i-heroicons-check" class="w-5 h-5 text-green-500"/>
                <span>Outbox configured</span>
              </div>
            </div>
            <UButton to="/" color="primary">
              Go to Timeline
            </UButton>
          </div>
        </UCard>
      </div>
    </UContainer>

    <LoginModal v-model="showLoginModal"/>
  </div>
</template>
