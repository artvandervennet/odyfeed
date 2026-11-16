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
    <div class="band error-page" data-paint="deep">
      <div class="inner">
        <art-splatter size="9rem" seed="error"/>
        <h1>{{ errorCode }}</h1>
        <p class="lead">{{ errorMessage }}</p>
        <art-button size="l">
          <button type="button" @click="handleError">Go Home</button>
        </art-button>
      </div>
    </div>
  </NuxtLayout>
</template>
