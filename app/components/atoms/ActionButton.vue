<script setup lang="ts">
interface Props {
  icon: string
  loading?: boolean
  disabled?: boolean
  count?: number
  variant?: 'ghost' | 'solid' | 'outline' | 'soft' | 'link'
  color?: 'primary' | 'secondary' | 'neutral' | 'success' | 'warning' | 'error'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'ghost',
  color: 'secondary',
  size: 'xs',
})

const emit = defineEmits<{
  click: [event: Event]
}>()
</script>

<template>
  <UButton
      :variant="variant"
      :color="color"
      :size="size"
      :icon="icon"
      :loading="loading"
      :disabled="disabled || loading"
      :aria-label="ariaLabel"
      @click="emit('click', $event)"
  >
    <span v-if="count !== undefined">{{ count }}</span>
  </UButton>
</template>
