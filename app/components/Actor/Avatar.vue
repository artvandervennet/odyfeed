<script setup lang="ts">
const props = defineProps<{
  avatarUrl?: string
  username: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
}>()

// Gesso's .avatar: a photo, or the first letter of the name in a dab of paint
const sizeClass = computed(() => {
  if (props.size === 'lg') return 'large'
  if (props.size === 'md') return ''
  return 'small'
})
const pixels = computed(() => (props.size === 'lg' ? 96 : props.size === 'md' ? 48 : 32))
const initial = computed(() => (props.username || '?').trim().charAt(0).toUpperCase())
</script>

<template>
  <img
    v-if="avatarUrl"
    class="avatar"
    :class="sizeClass"
    :src="avatarUrl"
    :alt="username"
    :width="pixels"
    :height="pixels"
  >
  <span v-else class="avatar" :class="sizeClass" role="img" :aria-label="username">{{ initial }}</span>
</template>
