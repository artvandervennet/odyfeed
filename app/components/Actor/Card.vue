<script setup lang="ts">
import type {ASActor} from '~~/shared/types/activitypub'
import {computed} from "vue";

interface Props {
  actor: ASActor
  showTone?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
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
  <div class="byline">
    <!-- the name next to it is the link people use; this one is the same link again, so it
         stays out of the tab order and out of the accessibility tree -->
    <NuxtLink :to="actorProfileUrl" tabindex="-1" aria-hidden="true">
      <ActorAvatar :avatar-url="avatarUrl" :username="displayName" :size="size"/>
    </NuxtLink>

    <div class="byline-text">
      <p>
        <NuxtLink :to="actorProfileUrl" class="byline-name">{{ displayName }}</NuxtLink>
        <span v-if="showTone && actorTone" class="byline-tone">{{ actorTone }}</span>
      </p>
      <p class="byline-handle">@{{ handle }}</p>
    </div>
  </div>
</template>
