<script setup lang="ts">
interface Props {
  count?: number
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  count: 3,
  height: 'h-40',
})
</script>

<template>
  <div class="space-y-4">
    <USkeleton v-for="i in count" :key="i" :class="[height, 'w-full']"/>
  </div>
</template>
