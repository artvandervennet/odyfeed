<script setup lang="ts">
import type { MythActor } from '~~/shared/types/activitypub'

const props = defineProps<{
  actor: MythActor
  showTone?: boolean
}>()

const actorProfileUrl = computed(() => {
  const username = props.actor.preferredUsername || props.actor.id.split('/').pop()
  return `/actors/${username}`
})
</script>

<template>
  <div class="flex items-start justify-between w-full gap-2">
    <NuxtLink
      :to="actorProfileUrl"
      class="flex items-center gap-3 group flex-1 min-w-0"
    >
      <ActorAvatar
        :avatar-url="actor.avatar"
        :username="actor.preferredUsername"
      />
      <div class="flex flex-col min-w-0">
        <div class="flex items-center gap-2">
          <span class="font-bold group-hover:underline truncate">
            {{ actor.preferredUsername || 'Unknown' }}
          </span>
          <span v-if="showTone && actor.tone" class="text-xs italic text-gray-400 shrink-0">
            {{ actor.tone }}
          </span>
        </div>
        <span class="text-sm text-gray-500 truncate">
          @{{ actor.preferredUsername }}
        </span>
      </div>
    </NuxtLink>
  </div>
</template>

