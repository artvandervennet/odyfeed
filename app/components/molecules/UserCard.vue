<script setup lang="ts">
import type {MythActor, ASActor} from '~~/shared/types/activitypub'

interface Props {
  actor: MythActor | ASActor
  showTone?: boolean
  clickable?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  clickable: true,
  size: 'sm',
})

const {getAvatarUrl} = useActorAvatar()

const actorProfileUrl = computed(() => {
  const username = props.actor.preferredUsername || props.actor.id.split('/').pop()
  return `/actors/${username}`
})

const avatarUrl = computed(() => getAvatarUrl(props.actor))
const actorTone = computed(() => ('tone' in props.actor ? props.actor.tone : undefined))
const displayName = computed(() => props.actor.preferredUsername || 'Unknown')
</script>

<template>
  <div class="flex items-center gap-3 min-w-0">
    <component :is="clickable ? 'NuxtLink' : 'div'" :to="clickable ? actorProfileUrl : undefined">
      <ActorAvatar :avatar-url="avatarUrl" :username="displayName" :size="size"/>
    </component>

    <div class="flex flex-col min-w-0 flex-1">
      <div class="flex items-center gap-2">
        <component
            :is="clickable ? 'NuxtLink' : 'span'"
            :to="clickable ? actorProfileUrl : undefined"
            class="font-bold truncate"
            :class="{ 'hover:underline': clickable }"
        >
          {{ displayName }}
        </component>
        <span v-if="showTone && actorTone" class="text-xs italic text-gray-400 shrink-0">
					{{ actorTone }}
				</span>
      </div>
      <span class="text-sm text-gray-500 truncate"> @{{ displayName }} </span>
    </div>
  </div>
</template>
