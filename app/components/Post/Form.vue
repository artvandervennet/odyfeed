<script setup lang="ts">
import { useAuthStore } from '~/stores/authStore'

const replyContent = defineModel<string>({ required: true })

defineProps<{
  placeholder?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  submit: []
  cancel: []
}>()

const auth = useAuthStore()
</script>

<template>
  <div class="space-y-3">
    <div class="flex gap-3">
      <div class="flex-1">
        <UTextarea
          v-model="replyContent"
          :placeholder="placeholder || 'Write your reply...'"
          :rows="3"
          autofocus
          :disabled="disabled"
          class="w-full"
        />
      </div>
    </div>
    <div class="flex justify-end gap-2">
      <UButton
        size="sm"
        color="neutral"
        variant="ghost"
        @click="emit('cancel')"
      >
        Cancel
      </UButton>
      <UButton
        size="sm"
        color="primary"
        icon="i-heroicons-paper-airplane"
        :disabled="!replyContent.trim() || disabled"
        @click="emit('submit')"
      >
        Reply
      </UButton>
    </div>
  </div>
</template>

