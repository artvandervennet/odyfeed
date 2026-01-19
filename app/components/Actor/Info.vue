<script setup lang="ts">
import type {MythActor, ASActor} from '~~/shared/types/activitypub'
import UserCard from "~/components/molecules/UserCard.vue";

interface Props {
  actor: MythActor | ASActor
  showTone?: boolean
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  clickable: true,
})
</script>

<template>
  <div class="flex items-start justify-between w-full gap-2">
    <UserCard :actor="actor" :show-tone="showTone" :clickable="clickable"/>
  </div>
</template>

