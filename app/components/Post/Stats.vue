<script setup lang="ts">
import ActionButton from "~/components/atoms/ActionButton.vue";

interface Props {
  likesCount: number
  repliesCount: number
  isLiked: boolean
  disabled?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  like: [event: Event]
  reply: [event: Event]
}>()
</script>

<template>
  <div class="post-actions">
    <ActionButton
        icon="i-heroicons-chat-bubble-left"
        label="Reply"
        :count="repliesCount"
        :disabled="disabled"
        @click="emit('reply', $event)"
    />
    <!-- liked or not is said by aria-pressed and shown by the filled heart, not by colour -->
    <ActionButton
        :icon="isLiked ? 'i-heroicons-heart-20-solid' : 'i-heroicons-heart'"
        label="Like"
        :count="likesCount"
        :pressed="isLiked"
        :disabled="disabled"
        @click="emit('like', $event)"
    />
  </div>
</template>
