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
    <div class="band page-head" data-paint="deep">
      <div class="inner">
        <h1>Set up your Pod</h1>
      </div>
      <art-drip class="band-drip" pigment="--surface" seed="setup" count="9" stagger flush/>
    </div>

    <div class="band" data-paint="1">
      <div class="inner narrow stack">
        <div v-if="validationError" class="card setup-error">
          <p class="form-message" role="alert">{{ validationError }}</p>
          <p v-if="validationError.includes('not supported')">
            This application requires an ActivityPods provider with ActivityStreams support. Generic Solid Pods are not supported.
          </p>
          <art-button variant="secondary">
            <button type="button" @click="validationError = null; showLoginModal = true">Try Again</button>
          </art-button>
        </div>

        <!-- Loading state -->
        <div v-if="isCheckingAuth" class="card empty" role="status">
          <h2>Checking authentication...</h2>
          <p>Please wait while we verify your session.</p>
        </div>

        <!-- Login prompt -->
        <div v-else-if="showLoginPrompt" class="card empty">
          <h2>Login Required</h2>
          <p>You need to be logged in to continue.</p>
          <div class="actions">
            <art-button variant="quiet">
              <NuxtLink to="/">Go Back</NuxtLink>
            </art-button>
            <art-button>
              <button type="button" @click="showLoginModal = true">Log in with Solid Pod</button>
            </art-button>
          </div>
        </div>

        <!-- Success - already registered -->
        <div v-else-if="showSuccessMessage" class="card setup-done">
          <h2>You're all set!</h2>
          <p>Your account is connected and ready to use.</p>
          <ul class="checks">
            <li>
              <Icon name="i-heroicons-check" aria-hidden="true"/>
              <span>Username: <code>{{ auth.username }}</code></span>
            </li>
            <li>
              <Icon name="i-heroicons-check" aria-hidden="true"/>
              <span>WebID: <code>{{ auth.webId }}</code></span>
            </li>
            <li v-if="auth.inbox">
              <Icon name="i-heroicons-check" aria-hidden="true"/>
              <span>Inbox configured</span>
            </li>
            <li v-if="auth.outbox">
              <Icon name="i-heroicons-check" aria-hidden="true"/>
              <span>Outbox configured</span>
            </li>
          </ul>
          <art-button>
            <NuxtLink to="/">Go to Timeline</NuxtLink>
          </art-button>
        </div>
      </div>
    </div>

    <LoginModal v-model="showLoginModal" :trigger="false"/>
  </div>
</template>
