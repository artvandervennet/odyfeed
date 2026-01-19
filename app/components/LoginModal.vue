<script setup lang="ts">
import { useAuthStore } from '~/stores/authStore'

const auth = useAuthStore()

const issuer = ref('https://login.inrupt.com')
const customIssuer = ref('')
const useCustom = ref(false)
const isLoggingIn = ref(false)
const errorMessage = ref('')

const providers = [
  {
    name: 'Inrupt PodSpaces',
    url: 'https://login.inrupt.com',
    description: 'Enterprise Solid pods by Inrupt',
    icon: 'i-heroicons-building-office',
    worksWithNgrok: true,
  },
  {
    name: 'solidcommunity.net',
    url: 'https://solidcommunity.net',
    description: 'Community Solid pod provider',
    icon: 'i-heroicons-cube',
    worksWithNgrok: false,
  },
  {
    name: 'solidweb.org',
    url: 'https://solidweb.org',
    description: 'Public Solid pod provider',
    icon: 'i-heroicons-globe-alt',
    worksWithNgrok: false,
  },
]

const isNgrok = computed(() => {
  if (typeof window === 'undefined') return false
  return window.location.hostname.includes('ngrok')
})

const selectedProvider = computed(() => {
  return providers.find(p => p.url === issuer.value)
})

const showNgrokWarning = computed(() => {
  return isNgrok.value && selectedProvider.value && !selectedProvider.value.worksWithNgrok
})

const handleLogin = async function () {
  isLoggingIn.value = true
  errorMessage.value = ''

  try {
    const selectedIssuer = useCustom.value ? customIssuer.value : issuer.value

    if (!selectedIssuer) {
      errorMessage.value = 'Please enter a provider URL'
      isLoggingIn.value = false
      return
    }

    await auth.login(selectedIssuer)
  } catch (error) {
    errorMessage.value = 'Login failed. Please try again.'
    isLoggingIn.value = false
  }
}
</script>

<template>
  <UModal
      :close="{
      color: 'primary',
      variant: 'outline',
      class: 'rounded-full'
    }"
      title="Welcome to OdyFeed"
      description="Login to your Solid Pod to get started">
    <UButton
        label="Login"
        icon="i-heroicons-arrow-right-on-rectangle"
        size="sm"
        color="neutral"
        variant="ghost"
    />

    <template #body>

      <div class="space-y-5">
        <UAlert
            v-if="showNgrokWarning"
            color="warning"
            variant="soft"
            title="Provider Incompatibility"
            icon="i-heroicons-exclamation-triangle"
        >
          <template #description>
            <div class="space-y-2 text-sm">
              <p>{{ selectedProvider?.name }} does not work with ngrok free tier. The authentication will fail with a 500 error.</p>
              <p class="font-medium">Please use Inrupt PodSpaces instead, or deploy to a production server.</p>
            </div>
          </template>
        </UAlert>

        <div v-if="!useCustom" class="space-y-3">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Choose your Pod provider
          </label>
          <div class="space-y-2">
            <button
                v-for="provider in providers"
                :key="provider.url"
                type="button"
                class="w-full p-3.5 text-left border rounded-lg transition-all"
                :class="issuer === provider.url
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30 shadow-sm'
                : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50'"
                @click="issuer = provider.url"
            >
              <div class="flex items-center gap-3">
                <div
                    class="flex items-center justify-center w-9 h-9 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <UIcon :name="provider.icon" class="w-4 h-4 text-gray-600 dark:text-gray-400"/>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="font-medium text-gray-900 dark:text-white">{{ provider.name }}</span>
                      <UBadge
                          v-if="isNgrok && provider.worksWithNgrok"
                          color="success"
                          variant="soft"
                          size="xs"
                      >
                        Works with ngrok
                      </UBadge>
                      <UBadge
                          v-if="isNgrok && !provider.worksWithNgrok"
                          color="warning"
                          variant="soft"
                          size="xs"
                      >
                        Requires production URL
                      </UBadge>
                    </div>
                    <UIcon
                        v-if="issuer === provider.url"
                        name="i-heroicons-check-circle-solid"
                        class="w-5 h-5 text-primary-500"
                    />
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {{ provider.description }}
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div v-else class="space-y-3">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Custom Pod provider URL
          </label>
          <UInput
              v-model="customIssuer"
              placeholder="https://vandervennet.art"
              icon="i-heroicons-link"
              size="md"
          />
        </div>

        <div class="pt-2">
          <UButton
              :label="useCustom ? '← Back to providers' : 'Use custom provider'"
              variant="ghost"
              color="neutral"
              size="sm"
              @click="useCustom = !useCustom"
          />
        </div>
      </div>
    </template>

    <template #footer>
      <div class="space-y-3">
        <UAlert
            v-if="errorMessage"
            color="error"
            variant="soft"
            :title="errorMessage"
            :close="{ color: 'error', variant: 'link' }"
            @close="errorMessage = ''"
        />
        <div class="flex items-center justify-between gap-3">
          <p class="text-xs text-gray-500 dark:text-gray-400">
            New to Solid? <a href="https://solidproject.org/users/get-a-pod" target="_blank" class="text-primary-500 hover:text-primary-600 underline">Get a Pod</a>
          </p>
          <UButton
              label="Continue"
              icon="i-heroicons-arrow-right"
              trailing
              :loading="isLoggingIn"
              :disabled="isLoggingIn || (useCustom && !customIssuer)"
              @click="handleLogin"
          />
        </div>
      </div>
    </template>

  </UModal>
</template>

