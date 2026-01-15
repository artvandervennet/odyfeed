<script setup lang="ts">
const props = defineProps<{
  likesCount: number
  repliesCount: number
  isLiked: boolean
}>()

const emit = defineEmits<{
  like: []
  reply: []
}>()
</script>

<template>
  <div class="flex items-center gap-2">
    <UButton
        @click="emit('reply')"
        variant="ghost"
        color="secondary"
        size="xs"
        icon="i-heroicons-chat-bubble-left">
      {{ repliesCount }}
    </UButton>
    <UButton
        @click="emit('like')"
        variant="ghost"
        :color="isLiked ? 'primary' : 'secondary'"
        size="xs"
        :icon="isLiked ? 'i-heroicons-heart-20-solid' : 'i-heroicons-heart'">
      {{ likesCount }}
    </UButton>
  </div>
</template>
