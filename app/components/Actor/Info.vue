<script setup lang="ts">
import type { ASActor } from '~~/shared/types/activitypub'

interface Props {
  actor: ASActor
  showTone?: boolean
}

defineProps<Props>()
</script>

<template>
  <div class="flex items-start justify-between w-full gap-2">
    <ActorCard :actor="actor" :show-tone="showTone"/>
  </div>
</template>

