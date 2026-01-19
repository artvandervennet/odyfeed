<script setup>
import { useTimelineQuery } from "~/queries/timeline"

const { data: timeline, isLoading } = useTimelineQuery()

const baseUrl = computed(() => typeof window !== 'undefined' ? window.location.origin : '')

const displayMode = ref('grouped')

const hasGroupedData = computed(() => {
  return timeline.value?.groupedByEvent && timeline.value.groupedByEvent.length > 0
})
</script>

<template>
  <UContainer>
    <div class="max-w-2xl mx-auto">
      <div class="mb-8 h-card">
        <h1 class="p-name text-3xl font-bold mb-2">Timeline</h1>
        <p class="p-note text-gray-500 dark:text-gray-400">The story of the Odysee, told through the eyes of its actors.</p>
        <a :href="baseUrl" class="u-url hidden" rel="me">OdyFeed</a>
      </div>

      <div v-if="hasGroupedData" class="mb-4 flex gap-2">
        <UButton
          :color="displayMode === 'grouped' ? 'primary' : 'secondary'"
          :variant="displayMode === 'grouped' ? 'solid' : 'ghost'"
          size="sm"
          @click="displayMode = 'grouped'"
        >
          Story Mode
        </UButton>
        <UButton
          :color="displayMode === 'chronological' ? 'primary' : 'secondary'"
          :variant="displayMode === 'chronological' ? 'solid' : 'ghost'"
          size="sm"
          @click="displayMode = 'chronological'"
        >
          Timeline Mode
        </UButton>
      </div>

      <div v-if="isLoading && !timeline" class="space-y-4">
        <USkeleton v-for="i in 3" :key="i" class="h-40 w-full" />
      </div>

      <div v-else-if="timeline?.orderedItems">
        <div v-if="displayMode === 'grouped' && hasGroupedData" class="space-y-8">
          <div
            v-for="group in timeline.groupedByEvent"
            :key="group.event.id"
            class="space-y-4"
          >
            <div class="bg-linear-to-r from-primary-500/10 to-primary-600/10 dark:from-primary-400/10 dark:to-primary-500/10 p-6 rounded-lg border border-primary-200 dark:border-primary-800">
              <div class="flex items-start gap-4">
                <div class="shrink-0 w-12 h-12 rounded-full bg-primary-500 dark:bg-primary-600 flex items-center justify-center text-white font-bold text-lg">
                  {{ group.event.sequence }}
                </div>
                <div class="flex-1">
                  <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {{ group.event.title }}
                  </h2>
                  <p class="text-gray-600 dark:text-gray-400 mb-3">
                    {{ group.event.description }}
                  </p>
                  <div v-if="group.event.actors.length > 0" class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <UIcon name="i-heroicons-user-group" class="w-4 h-4" />
                    <span>Featuring: {{ group.event.actors.map(a => a.name).join(', ') }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="space-y-0 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
              <PostCard
                v-for="post in group.posts"
                :key="post.id"
                :post="post"
              />
            </div>
          </div>
        </div>

        <div v-else class="space-y-0 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
          <PostCard
            v-for="post in timeline.orderedItems"
            :key="post.id"
            :post="post"
          />
        </div>
      </div>

      <UCard v-else-if="timeline" class="text-center py-10">
        <UIcon name="i-heroicons-information-circle" class="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p class="text-gray-500">The timeline is empty. Check back later!</p>
      </UCard>
    </div>
  </UContainer>
</template>