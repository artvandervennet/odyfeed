<script setup lang="ts">
import type { ASActor } from '~~/shared/types/activitypub'

interface Props {
  actor: ASActor
  isOwnProfile?: boolean
}

const props = defineProps<Props>()

const { getAvatarUrl } = useActorAvatar()

const avatarUrl = computed(() => getAvatarUrl(props.actor))
</script>

<template>
  <!-- The top of a profile: a deep band with the sea rolling along its lower edge. -->
  <div class="band page-head profile-head" data-paint="deep">
    <div class="sea" aria-hidden="true">
      <div class="wave wave1"/>
      <div class="wave wave2"/>
      <div class="wave wave3"/>
    </div>

    <div class="inner">
      <div class="profile-id">
        <ActorAvatar :username="actor.name" :avatar-url="avatarUrl" size="lg"/>

        <div>
          <h1>{{ actor.name }}</h1>
          <p class="profile-handle">@{{ actor.preferredUsername }}</p>
          <art-tape v-if="isOwnProfile">Your profile</art-tape>
          <art-tape v-else-if="actor.tone" :seed="actor.preferredUsername">{{ actor.tone }}</art-tape>
        </div>

        <art-button v-if="isOwnProfile" variant="secondary" class="profile-edit">
          <NuxtLink to="/profile">Edit profile</NuxtLink>
        </art-button>
      </div>

      <p v-if="actor.summary" class="lead">{{ actor.summary }}</p>

      <slot name="stats" />
    </div>
  </div>
</template>

<style scoped>
/* Three waves in the theme's own blues, drifting at different speeds. Each is a strip of the
   pigment with a wave cut out of it by a mask, so it follows the theme and the scheme. */
.profile-head {
  overflow: hidden;
}

.sea {
  position: absolute;
  inset: auto 0 0;
  block-size: 5rem;
}

.wave {
  position: absolute;
  inset: 0 auto 0 0;
  inline-size: 200%;
  mask-repeat: repeat-x;
  mask-size: 50% 100%;
  animation: drift 25s linear infinite;
}

.wave1 {
  background: var(--pigment-brand-light);
  opacity: 0.22;
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,50 C150,80 350,20 600,50 C850,80 1050,20 1200,50 L1200,120 L0,120 Z'/%3E%3C/svg%3E");
}

.wave2 {
  background: var(--pigment-brand-light);
  opacity: 0.16;
  animation-duration: 20s;
  animation-direction: reverse;
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,60 C200,90 400,30 600,60 C800,90 1000,30 1200,60 L1200,120 L0,120 Z'/%3E%3C/svg%3E");
}

.wave3 {
  background: var(--surface-sunken);
  opacity: 0.7;
  animation-duration: 30s;
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,70 C250,100 450,40 600,70 C750,100 950,40 1200,70 L1200,120 L0,120 Z'/%3E%3C/svg%3E");
}

.inner {
  position: relative;
}

@keyframes drift {
  to {
    translate: -50% 0;
  }
}

/* decoration only: still water for people who ask for less motion */
@media (prefers-reduced-motion: reduce) {
  .wave {
    animation: none;
  }
}
</style>
