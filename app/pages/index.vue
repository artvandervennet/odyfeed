<script setup>
import { useTimelineQuery } from "~/queries/timeline"
import LoadingCard from "~/components/atoms/LoadingCard.vue"
import EmptyState from "~/components/atoms/EmptyState.vue"
import ScrollProgressBar from "~/components/atoms/ScrollProgressBar.vue"
import { useEventProgress } from "~/composables/useEventProgress"
import { useWebmentions } from "~/composables/useWebmentions"

const { data: timeline, isLoading } = useTimelineQuery()

const { currentEventIndex, totalEvents, registerEventElement } = useEventProgress(timeline)

const { webmentionCount } = useWebmentions()


const baseUrl = computed(() => typeof window !== 'undefined' ? window.location.origin : '')
</script>

<template>
  <div class="pb-20">
    <ScrollProgressBar
      :total-events="totalEvents"
      :current-event-index="currentEventIndex"
      :webmention-count="webmentionCount"
    />
    <UContainer>
      <div class="max-w-2xl mx-auto">
        <div class="mb-8 h-card">
          <h1 class="p-name text-3xl font-bold mb-2">Timeline</h1>
          <p class="p-note text-gray-500 dark:text-gray-400">The story of the Odysee, told through the eyes of its actors.</p>
          <a :href="baseUrl" class="u-url hidden" rel="me">OdyFeed</a>
        </div>

        <LoadingCard v-if="isLoading && !timeline" />

        <div v-else-if="timeline?.groupedByEvent && timeline.groupedByEvent.length > 0" class="space-y-8">
          <div
            v-for="group in timeline.groupedByEvent"
            :key="group.event.id"
            :ref="(el) => registerEventElement(group.event.id, el)"
            class="space-y-3"
          >
            <div class="flex items-center gap-3 px-2">
              <div class="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
              <h2 class="text-sm font-medium text-gray-600 dark:text-gray-400">
                {{ group.event.title }}
              </h2>
              <div class="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
            </div>

            <div v-if="group.posts && group.posts.length > 0">
              <PostList
                  :posts="group.posts"
                  :empty="'No posts yet.'"
              />
            </div>

            <div v-else class="border border-gray-200 dark:border-gray-800 rounded-lg p-8">
              <p class="text-gray-500 dark:text-gray-400 text-center mb-4">{{ group.event.description }}</p>
              <div class="bg-gray-100 dark:bg-gray-900 rounded p-6 space-y-4">
                <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6"></div>
                <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3"></div>
                <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-4/5"></div>
                <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>

        <EmptyState
          v-else-if="timeline"
          icon="i-heroicons-information-circle"
          title="No posts yet"
          description="The timeline is empty. Check back later!"
        />
      </div>
    </UContainer>
  </div>
</template>