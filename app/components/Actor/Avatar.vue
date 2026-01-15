<script setup lang="ts">
const props = defineProps<{
  avatarUrl?: string
  username: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
}>()
</script>

<template>
  <UAvatar
    :src="avatarUrl"
    :alt="username"
    :size="size || 'sm'"
  />
</template>

