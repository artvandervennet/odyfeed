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
  <form class="card webmention-form" @submit.prevent="handleSubmit">
    <h3>Send a Webmention</h3>

    <div class="field">
      <label for="webmention-source">Your post URL</label>
      <p id="webmention-hint" class="hint">Enter the URL of your post that mentions this content</p>
      <div class="field-row">
        <input
          id="webmention-source"
          v-model="sourceUrl"
          type="url"
          inputmode="url"
          placeholder="https://yoursite.com/your-post"
          aria-describedby="webmention-hint"
          :disabled="webmentionMutation.isLoading.value"
          required
        >
        <art-button>
          <button type="submit" :disabled="!sourceUrl || webmentionMutation.isLoading.value">
            {{ webmentionMutation.isLoading.value ? 'Sending…' : 'Send' }}
          </button>
        </art-button>
      </div>
    </div>

    <p v-if="errorMessage" class="form-message" role="alert">{{ errorMessage }}</p>
    <p v-if="successMessage" class="form-message" role="status">{{ successMessage }}</p>
  </form>
</template>
