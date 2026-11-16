<script setup lang="ts">
interface Props {
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  count: 3,
})
</script>

<template>
  <div class="stack" aria-busy="true">
    <span class="visually-hidden" role="status">Loading…</span>
    <div v-for="i in count" :key="i" class="skeleton skeleton-card"/>
  </div>
</template>
