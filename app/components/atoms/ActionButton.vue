<script setup lang="ts">
// A small button on a post: an icon, a word for what it does, and optionally a count.
// The word is always there for screen readers; `label-visible` shows it as well.
interface Props {
  icon: string
  label: string
  count?: number
  pressed?: boolean
  disabled?: boolean
  labelVisible?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: [event: Event]
}>()
</script>

<template>
  <button
      type="button"
      class="action"
      :disabled="disabled"
      :aria-pressed="pressed === undefined ? undefined : pressed"
      @click="emit('click', $event)"
  >
    <Icon :name="icon" aria-hidden="true"/>
    <span :class="{ 'visually-hidden': !labelVisible }">{{ label }}</span>
    <span v-if="count !== undefined">{{ count }}</span>
  </button>
</template>
