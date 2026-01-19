<script setup lang="ts">
import type {ASActor} from '~~/shared/types/activitypub'
import {computed} from "vue";

interface Props {
  actor: ASActor
  showTone?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'sm',
})

const {getAvatarUrl} = useActorAvatar()

const actorProfileUrl = computed(() => {
  const username = props.actor.preferredUsername || props.actor.id.split('/').pop()
  return `/actors/${username}`
})

const avatarUrl = computed(() => getAvatarUrl(props.actor))
const actorTone = computed(() => props.actor.tone)
const displayName = computed(() => props.actor.name || 'Unknown')
const handle = computed(() => props.actor.preferredUsername || 'unknown')
</script>

<template>
  <div class="flex items-center gap-3 min-w-0">
    <NuxtLink :to="actorProfileUrl">
      <ActorAvatar :avatar-url="avatarUrl" :username="displayName" :size="size"/>
    </NuxtLink>

    <div class="flex flex-col min-w-0 flex-1">
      <div class="flex items-center gap-2">
        <NuxtLink
            :to="actorProfileUrl"
            class="font-bold truncate hover:underline"
        >
          {{ displayName }}
        </NuxtLink>
        <span v-if="showTone && actorTone" class="text-xs italic text-gray-400 shrink-0">
					{{ actorTone }}
				</span>
      </div>
      <span class="text-sm text-gray-500 truncate"> @{{ handle }} </span>
    </div>
  </div>
</template>
