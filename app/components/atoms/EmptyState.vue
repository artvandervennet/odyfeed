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
  <!-- Gesso's .empty: a splatter, one plain sentence, one way forward -->
  <div class="card empty">
    <art-splatter size="6rem" :seed="title"/>

    <h2>{{ title }}</h2>

    <p v-if="description">{{ description }}</p>

    <art-button v-if="actionLabel">
      <NuxtLink v-if="actionTo" :to="actionTo">{{ actionLabel }}</NuxtLink>
      <button v-else type="button" @click="emit('action')">{{ actionLabel }}</button>
    </art-button>
  </div>
</template>
