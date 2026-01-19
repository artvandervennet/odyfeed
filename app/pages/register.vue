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
  <div class="min-h-screen flex items-center justify-center p-4">
    <UContainer>
      <div class="max-w-xl mx-auto">
        <UCard>
          <template #header>
            <div class="text-center">
              <div class="flex items-center justify-center gap-2 mb-2">
                <UIcon name="i-heroicons-sparkles" class="text-primary-500 w-8 h-8"/>
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Complete Your Profile</h1>
              </div>
              <p class="text-gray-500 dark:text-gray-400">Create a username to start using OdyFeed</p>
            </div>
          </template>

          <div class="space-y-5">
            <UAlert
                icon="i-heroicons-information-circle"
                color="primary"
                variant="soft"
                title="One more step!"
                description="Choose a username for your ActivityPub profile on this server."
            />

            <div class="space-y-4">
              <div class="space-y-2">
                <label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Username <span class="text-red-500">*</span>
                </label>
                <UInput
                    id="username"
                    v-model="username"
                    placeholder="odysseus"
                    icon="i-heroicons-at-symbol"
                    :disabled="isRegistering"
                    :color="!isValidUsername && username.length > 0 ? 'error' : 'primary'"
                    size="md"
                    @keyup.enter="handleRegister"
                />
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  Only lowercase letters, numbers, hyphens, and underscores
                </p>
                <p v-if="!isValidUsername && username.length > 0" class="text-xs text-red-500">
                  Invalid username format
                </p>
              </div>

              <div class="space-y-2">
                <label for="displayName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Display Name
                </label>
                <UInput
                    id="displayName"
                    v-model="name"
                    placeholder="Odysseus of Ithaca"
                    icon="i-heroicons-user"
                    :disabled="isRegistering"
                    size="md"
                />
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  Optional: How your name appears to others
                </p>
              </div>

              <div class="space-y-2">
                <label for="bio" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Bio
                </label>
                <UTextarea
                    id="bio"
                    v-model="summary"
                    placeholder="King of Ithaca, wanderer, storyteller..."
                    :disabled="isRegistering"
                    :rows="3"
                    size="md"
                />
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  Optional: Tell others about yourself
                </p>
              </div>
            </div>

            <UAlert
                v-if="errorMessage"
                icon="i-heroicons-exclamation-triangle"
                color="error"
                variant="soft"
                :title="errorMessage"
                :close="{ color: 'error', variant: 'link' }"
                @close="errorMessage = ''"
            />

            <div class="flex items-center justify-between gap-3 pt-2">
              <UButton
                  label="Back to Home"
                  icon="i-heroicons-arrow-left"
                  color="neutral"
                  variant="ghost"
                  :disabled="isRegistering"
                  @click="navigateTo('/')"
              />
              <UButton
                  label="Create Profile"
                  icon="i-heroicons-check"
                  trailing
                  :loading="isRegistering"
                  :disabled="!username || !isValidUsername || isRegistering"
                  @click="handleRegister"
              />
            </div>
          </div>
        </UCard>
      </div>
    </UContainer>
  </div>
</template>
