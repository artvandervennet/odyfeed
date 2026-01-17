<script setup lang="ts">
import type { MythActor, ASActor } from '~~/shared/types/activitypub'

const props = defineProps<{
  actor: MythActor | ASActor
  showTone?: boolean
}>()

const { getAvatarUrl } = useActorAvatar()

const actorProfileUrl = computed(() => {
  const username = props.actor.preferredUsername || props.actor.id.split('/').pop()
  return `/actors/${username}`
})

const avatarUrl = computed(() => getAvatarUrl(props.actor))
const actorTone = computed(() => 'tone' in props.actor ? props.actor.tone : undefined)
</script>

<template>
  <div class="flex items-start justify-between w-full gap-2">
    <NuxtLink
      :to="actorProfileUrl"
      class="flex items-center gap-3 group flex-1 min-w-0"
    >
      <ActorAvatar
        :avatar-url="avatarUrl"
        :username="actor.preferredUsername"
      />
      <div class="flex flex-col min-w-0">
        <div class="flex items-center gap-2">
          <span class="font-bold group-hover:underline truncate">
            {{ actor.preferredUsername || 'Unknown' }}
          </span>
          <span v-if="showTone && actorTone" class="text-xs italic text-gray-400 shrink-0">
            {{ actorTone }}
          </span>
        </div>
        <span class="text-sm text-gray-500 truncate">
          @{{ actor.preferredUsername }}
        </span>
      </div>
    </NuxtLink>
  </div>
</template>

