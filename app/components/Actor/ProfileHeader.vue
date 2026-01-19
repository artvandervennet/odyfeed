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
  <div class="relative">
    <div class="z-0 ocean-background absolute top-0 left-0 right-0 h-32 sm:h-40">
      <div class="wave wave1"></div>
      <div class="wave wave2"></div>
      <div class="wave wave3"></div>
    </div>

    <div class="px-4 sm:px-6 pb-6 z-10">
      <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-14 sm:-mt-16 relative">
        <div class="flex flex-col sm:flex-row sm:items-end gap-4">
          <div class="relative w-24 h-24 sm:w-28 sm:h-28">
            <ActorAvatar :username="actor.name" :avatarUrl="avatarUrl" size="lg" class="w-full h-full ring-4 ring-white dark:ring-gray-900"/>
          </div>

          <div class="flex-1 pt-2">
            <div class="flex items-center gap-2 mb-1 flex-wrap">
              <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {{ actor.name }}
              </h1>
              <UBadge v-if="isOwnProfile" color="primary" variant="subtle" size="sm">
                Your Profile
              </UBadge>
              <UBadge v-else-if="actor.tone" color="neutral" variant="subtle" size="sm">
                {{ actor.tone }}
              </UBadge>
            </div>
            <p class="text-base text-gray-500 dark:text-gray-400">
              @{{ actor.preferredUsername }}
            </p>
          </div>
        </div>

        <div v-if="isOwnProfile" class="flex justify-start sm:justify-end">
          <UButton
            to="/profile"
            color="neutral"
            variant="solid"
            icon="i-heroicons-pencil-square"
            size="md"
          >
            Edit Profile
          </UButton>
        </div>
      </div>

      <div v-if="actor.summary" class="mt-6">
        <p class="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
          {{ actor.summary }}
        </p>
      </div>

      <slot name="stats" />
    </div>
  </div>
</template>

<style scoped>
.ocean-background {
  position: relative;
  background: linear-gradient(180deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%);
  overflow: hidden;
}

.dark .ocean-background {
  background: linear-gradient(180deg, #0c4a6e 0%, #075985 50%, #0369a1 100%);
}

.wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 200%;
  height: 100%;
  background-repeat: repeat-x;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}

.wave1 {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,50 C150,80 350,20 600,50 C850,80 1050,20 1200,50 L1200,120 L0,120 Z' fill='%2338bdf8' fill-opacity='0.8'/%3E%3C/svg%3E");
  background-size: 50% 100%;
  animation-name: wave-animation;
  animation-duration: 25s;
  z-index: 3;
  opacity: 1;
}

.wave2 {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,60 C200,90 400,30 600,60 C800,90 1000,30 1200,60 L1200,120 L0,120 Z' fill='%2322d3ee' fill-opacity='0.7'/%3E%3C/svg%3E");
  background-size: 50% 100%;
  animation-name: wave-animation-reverse;
  animation-duration: 20s;
  z-index: 2;
  opacity: 0.85;
}

.wave3 {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,70 C250,100 450,40 600,70 C750,100 950,40 1200,70 L1200,120 L0,120 Z' fill='%2306b6d4' fill-opacity='0.6'/%3E%3C/svg%3E");
  background-size: 50% 100%;
  animation-name: wave-animation;
  animation-duration: 30s;
  z-index: 1;
  opacity: 0.7;
}

.dark .wave1 {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,50 C150,80 350,20 600,50 C850,80 1050,20 1200,50 L1200,120 L0,120 Z' fill='%2338bdf8' fill-opacity='0.6'/%3E%3C/svg%3E");
}

.dark .wave2 {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,60 C200,90 400,30 600,60 C800,90 1000,30 1200,60 L1200,120 L0,120 Z' fill='%2322d3ee' fill-opacity='0.5'/%3E%3C/svg%3E");
}

.dark .wave3 {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,70 C250,100 450,40 600,70 C750,100 950,40 1200,70 L1200,120 L0,120 Z' fill='%2306b6d4' fill-opacity='0.4'/%3E%3C/svg%3E");
}

@keyframes wave-animation {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

@keyframes wave-animation-reverse {
  0% {
    transform: translateX(-50%);
  }
  100% {
    transform: translateX(0);
  }
}
</style>

