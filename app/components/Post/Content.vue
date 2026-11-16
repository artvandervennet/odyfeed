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
  <div class="post-content">
    <p class="e-content">{{ content }}</p>
    <time :datetime="published">{{ formattedDate }}</time>
  </div>
</template>
