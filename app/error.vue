<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const errorMessage = computed(() => {
  if (props.error.statusMessage) return props.error.statusMessage
  if (props.error.message) return props.error.message
  return 'An unexpected error occurred'
})

const errorCode = computed(() => props.error.statusCode || 500)

const handleError = function () {
  clearError({ redirect: '/' })
}
</script>

<template>
  <NuxtLayout>
    <div class="min-h-screen flex items-center justify-center px-4">
      <div class="max-w-md w-full text-center space-y-6">
        <div class="space-y-2">
          <h1 class="text-6xl font-bold text-primary">{{ errorCode }}</h1>
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
            {{ errorMessage }}
          </h2>
        </div>

        <UButton
          label="Go Home"
          icon="i-heroicons-home"
          size="lg"
          @click="handleError"
        />
      </div>
    </div>
  </NuxtLayout>
</template>

<style scoped>

</style>