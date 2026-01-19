<script setup lang="ts">
interface Props {
  icon?: string
  title: string
  description?: string
  actionLabel?: string
  actionTo?: string
  actionIcon?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  action: []
}>()
</script>

<template>
  <UCard class="text-center py-10">
    <UIcon
        :name="icon || 'i-heroicons-information-circle'"
        class="w-12 h-12 mx-auto text-gray-400 mb-4"
    />

    <h2 class="text-xl font-bold mb-2">{{ title }}</h2>

    <p v-if="description" class="text-gray-500 dark:text-gray-400 mb-4">
      {{ description }}
    </p>

    <UButton
        v-if="actionLabel"
        :to="actionTo"
        :icon="actionIcon"
        color="primary"
        @click="!actionTo && emit('action')"
    >
      {{ actionLabel }}
    </UButton>
  </UCard>
</template>
