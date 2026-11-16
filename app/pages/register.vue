<script setup lang="ts">
import {useAuthStore} from '~/stores/authStore'

const auth = useAuthStore()
const router = useRouter()

const username = ref('')
const name = ref('')
const summary = ref('')
const isRegistering = ref(false)
const errorMessage = ref('')

const isValidUsername = computed(() => {
  return /^[a-z0-9_-]+$/.test(username.value)
})

onMounted(async () => {
  if (auth.isLoggedIn) {
    await router.push('/')
    return
  }

  if (!auth.isAuthenticated) {
    await router.push('/')
    return
  }
})

const handleRegister = async function () {
  if (!username.value) {
    errorMessage.value = 'Username is required'
    return
  }

  if (!isValidUsername.value) {
    errorMessage.value = 'Username must contain only lowercase letters, numbers, hyphens, and underscores'
    return
  }

  isRegistering.value = true
  errorMessage.value = ''

  try {
    await auth.registerUser(username.value, {
      name: name.value || username.value,
      summary: summary.value || `ActivityPub actor for ${username.value}`,
    })

    console.log('[Registration] User registered successfully')

    await navigateTo('/')
  } catch (error) {
    console.error('[Registration] Registration failed:', error)
    const err = error as any
    if (err?.statusCode === 409) {
      errorMessage.value = 'Username is already taken. Please choose another.'
    } else {
      errorMessage.value = err?.message || 'Registration failed. Please try again.'
    }
    isRegistering.value = false
  }
}
</script>

<template>
  <div>
    <div class="band page-head" data-paint="deep">
      <div class="inner">
        <h1>Complete Your Profile</h1>
        <p class="lead">Create a username to start using OdyFeed</p>
      </div>
      <art-drip class="band-drip" pigment="--surface" seed="register" count="9" stagger flush/>
    </div>

    <div class="band" data-paint="1">
      <div class="inner narrow">
        <form class="card form" novalidate @submit.prevent="handleRegister">
          <p class="note">
            <strong>One more step!</strong>
            Choose a username for your ActivityPub profile on this server.
          </p>

          <div class="field">
            <label for="username">Username <span class="required">(required)</span></label>
            <input
                id="username"
                v-model="username"
                type="text"
                placeholder="odysseus"
                autocomplete="username"
                autocapitalize="none"
                spellcheck="false"
                required
                aria-describedby="username-hint username-error"
                :aria-invalid="!isValidUsername && username.length > 0"
                :disabled="isRegistering"
            >
            <p id="username-hint" class="hint">Only lowercase letters, numbers, hyphens, and underscores</p>
            <p id="username-error" class="form-message" role="alert">
              <template v-if="!isValidUsername && username.length > 0">Invalid username format</template>
            </p>
          </div>

          <div class="field">
            <label for="displayName">Display Name</label>
            <input
                id="displayName"
                v-model="name"
                type="text"
                placeholder="Odysseus of Ithaca"
                autocomplete="name"
                aria-describedby="displayName-hint"
                :disabled="isRegistering"
            >
            <p id="displayName-hint" class="hint">Optional: How your name appears to others</p>
          </div>

          <div class="field">
            <label for="bio">Bio</label>
            <textarea
                id="bio"
                v-model="summary"
                placeholder="King of Ithaca, wanderer, storyteller..."
                rows="3"
                aria-describedby="bio-hint"
                :disabled="isRegistering"
            />
            <p id="bio-hint" class="hint">Optional: Tell others about yourself</p>
          </div>

          <p v-if="errorMessage" class="form-message" role="alert">{{ errorMessage }}</p>

          <div class="actions">
            <art-button variant="quiet">
              <button type="button" :disabled="isRegistering" @click="navigateTo('/')">Back to Home</button>
            </art-button>
            <art-button>
              <button type="submit" :disabled="!username || !isValidUsername || isRegistering">
                {{ isRegistering ? 'Creating profile…' : 'Create Profile' }}
              </button>
            </art-button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
