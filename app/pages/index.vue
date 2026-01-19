<script setup>
import { useTimelineQuery } from "~/queries/timeline"
import LoadingCard from "~/components/atoms/LoadingCard.vue";
import EmptyState from "~/components/atoms/EmptyState.vue";

const { data: timeline, isLoading } = useTimelineQuery()

const baseUrl = computed(() => typeof window !== 'undefined' ? window.location.origin : '')
</script>

<template>
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
          class="space-y-3"
        >
          <div class="flex items-center gap-3 px-2">
            <div class="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
            <h2 class="text-sm font-medium text-gray-600 dark:text-gray-400">
              {{ group.event.title }}
            </h2>
            <div class="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
          </div>

          <PostList
              :posts="group.posts"
              :empty="'No posts yet.'"
          />
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
</template>