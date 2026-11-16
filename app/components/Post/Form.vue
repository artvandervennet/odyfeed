<script setup lang="ts">
const replyContent = defineModel<string>({ required: true })

defineProps<{
  placeholder?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  submit: []
  cancel: []
}>()

const fieldId = useId()

// the form appears because someone pressed Reply: put them in the field
const field = ref<HTMLTextAreaElement | null>(null)
onMounted(() => field.value?.focus())
</script>

<template>
  <form class="post-form" @submit.prevent="emit('submit')">
    <div class="field">
      <label :for="fieldId">Your reply</label>
      <textarea
        :id="fieldId"
        ref="field"
        v-model="replyContent"
        :placeholder="placeholder || 'Write your reply...'"
        rows="3"
        :disabled="disabled"
      />
    </div>
    <div class="actions">
      <art-button variant="quiet" size="s">
        <button type="button" @click="emit('cancel')">Cancel</button>
      </art-button>
      <art-button size="s">
        <button type="submit" :disabled="!replyContent.trim() || disabled">Reply</button>
      </art-button>
    </div>
  </form>
</template>
