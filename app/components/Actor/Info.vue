<script setup lang="ts">
import type { ASActor } from '~~/shared/types/activitypub'

interface Props {
  actor: ASActor
  showTone?: boolean
}

defineProps<Props>()
</script>

<template>
  <ActorCard :actor="actor" :show-tone="showTone"/>
</template>
