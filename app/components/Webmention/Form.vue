<script setup lang="ts">
import { useQueryCache } from '@pinia/colada'

const { targetUrl } = defineProps<{
  targetUrl: string
}>()

const sourceUrl = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const queryCache = useQueryCache()

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

  isLoading.value = true

  try {
    const response = await $fetch('/api/webmention', {
      method: 'POST',
      body: {
        source: sourceUrl.value,
        target: targetUrl,
      },
    })

    successMessage.value = 'Webmention sent successfully! It will appear shortly.'
    sourceUrl.value = ''

    await queryCache.invalidateQueries({ key: ['webmentions'] })
  } catch (error: any) {
    errorMessage.value = error.data?.message || error.message || 'Failed to send webmention'
  } finally {
    isLoading.value = false
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
    <div class="space-y-4">
      <div>
        <h3 class="text-lg font-semibold mb-2">Send a Webmention</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Have you written a response to this post on your own site?
          Enter the URL here to send a webmention.
        </p>
      </div>

      <form @submit.prevent="handleSubmit">
        <UFormGroup
          label="Your post URL"
          :error="errorMessage"
          class="mb-4"
        >
          <UInput
            v-model="sourceUrl"
            type="url"
            placeholder="https://yoursite.com/your-post"
            :disabled="isLoading"
            required
          />
        </UFormGroup>

        <div class="flex items-center gap-4">
          <UButton
            type="submit"
            :loading="isLoading"
            :disabled="!sourceUrl || isLoading"
          >
            Send Webmention
          </UButton>

          <p v-if="successMessage" class="text-sm text-green-600 dark:text-green-400">
            {{ successMessage }}
          </p>
        </div>
      </form>

      <UAlert
        v-if="!errorMessage && !successMessage"
        color="primary"
        variant="soft"
        title="What is a webmention?"
        description="A webmention is a way to notify this post that you've mentioned it on your site. Just paste your post URL above."
      />
    </div>
  </UCard>
</template>
