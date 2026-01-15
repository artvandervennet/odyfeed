<script setup lang="ts">
const props = defineProps<{
  content: string
  published: string
  showFullDate?: boolean
}>()

const formattedDate = computed(() => {
  const date = new Date(props.published)
  if (props.showFullDate) {
    return date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }
  return date.toLocaleString()
})
</script>

<template>
  <div>
    <div class="prose prose-sm max-w-none dark:prose-invert mb-3">
      {{ content }}
    </div>
    <time class="text-xs text-gray-400">
      {{ formattedDate }}
    </time>
  </div>
</template>

