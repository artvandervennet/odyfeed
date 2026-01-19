<script setup lang="ts">
defineProps<{
  likesCount: number
  repliesCount: number
  isLiked: boolean
  isLikeLoading?: boolean
  isReplyLoading?: boolean
}>()

const emit = defineEmits<{
  like: [event: Event]
  reply: [event: Event]
}>()
</script>

<template>
  <div class="flex items-center gap-2">
    <UButton
        @click="emit('reply', $event)"
        variant="ghost"
        color="secondary"
        size="xs"
        icon="i-heroicons-chat-bubble-left"
        :loading="isReplyLoading"
        :disabled="isReplyLoading">
      {{ repliesCount }}
    </UButton>
    <UButton
        @click="emit('like', $event)"
        variant="ghost"
        :color="isLiked ? 'primary' : 'secondary'"
        size="xs"
        :icon="isLiked ? 'i-heroicons-heart-20-solid' : 'i-heroicons-heart'"
        :loading="isLikeLoading"
        :disabled="isLikeLoading">
      {{ likesCount }}
    </UButton>
  </div>
</template>
