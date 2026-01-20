<script setup lang="ts">
import { useSendWebmentionMutation } from '~/mutations/webmention'

const { targetUrl } = defineProps<{
  targetUrl: string
}>()

const sourceUrl = ref('')
const errorMessage = ref('')
const successMessage = ref('')

const webmentionMutation = useSendWebmentionMutation()

const handleSubmit = async function () {
  errorMessage.value = ''
  successMessage.value = ''

  if (!sourceUrl.value.trim()) {
    errorMessage.value = 'Please enter a URL'
    return
  }

  if (!isValidUrl(sourceUrl.value)) {
    errorMessage.value = 'Please enter a valid URL'
    return
  }

  try {
    await webmentionMutation.mutateAsync({
      source: sourceUrl.value,
      target: targetUrl,
    })

    successMessage.value = 'Webmention sent successfully! It will appear shortly.'
    sourceUrl.value = ''
  } catch (error: any) {
    errorMessage.value = error.data?.message || error.message || 'Failed to send webmention'
  }
}

const isValidUrl = function (url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}
</script>

<template>
  <UCard>
      <form @submit.prevent="handleSubmit" class="space-y-2" target-url="">
        <div class="flex items-center gap-1.5">
          <h3 class="text-sm font-semibold">Send a Webmention</h3>
        </div>

        <div class="space-y-1.5">
          <div>
            <label for="webmention-source" class="block text-xs font-medium text-gray-700 dark:text-gray-300">
              Your post URL
            </label>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Enter the URL of your post that mentions this content
            </p>
          </div>
          <div class="flex gap-2">
            <input
              id="webmention-source"
              v-model="sourceUrl"
              type="url"
              placeholder="https://yoursite.com/your-post"
              :disabled="webmentionMutation.isLoading.value"
              class="flex-1 px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              required
            />
            <UButton
              type="submit"
              size="xs"
              :loading="webmentionMutation.isLoading.value"
              :disabled="!sourceUrl || webmentionMutation.isLoading.value"
            >
              Send
            </UButton>
          </div>
          <p v-if="errorMessage" class="text-xs text-red-600 dark:text-red-400">
            {{ errorMessage }}
          </p>
          <p v-if="successMessage" class="text-xs text-green-600 dark:text-green-400">
            {{ successMessage }}
          </p>
        </div>
      </form>
  </UCard>
</template>
