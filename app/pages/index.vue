<script setup>
import { useTimelineQuery } from "~/queries/timeline"

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

      <div v-if="isLoading && !timeline" class="space-y-4">
        <USkeleton v-for="i in 3" :key="i" class="h-40 w-full" />
      </div>

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

          <div class="space-y-0 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
            <PostCard
              v-for="post in group.posts"
              :key="post.id"
              :post="post"
            />
          </div>
        </div>
      </div>

      <UCard v-else-if="timeline" class="text-center py-10">
        <UIcon name="i-heroicons-information-circle" class="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p class="text-gray-500">The timeline is empty. Check back later!</p>
      </UCard>
    </div>
  </UContainer>
</template>