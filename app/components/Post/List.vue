<script setup lang="ts">
import type { EnrichedPost } from '~~/shared/types/activitypub'

defineProps<{
  posts: EnrichedPost[] | undefined
  isLoading?: boolean
  empty: string
  small?: boolean
}>()
</script>

<template>
  <div>
    <div v-if="isLoading" class="divide-y divide-gray-200 dark:divide-gray-800">
      <div v-for="i in 3" :key="i" class="p-4">
        <div class="flex gap-3">
          <USkeleton class="w-10 h-10 rounded-full shrink-0" />
          <div class="flex-1 space-y-2">
            <USkeleton class="h-3 w-24" />
            <USkeleton class="h-3 w-full" />
            <USkeleton class="h-3 w-2/3" />
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="!small && posts && posts.length > 0" class="space-y-0 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
      <PostCard
          v-for="post in posts"
          :key="post.id"
          :post="post"
      />
    </div>

    <div v-else-if="posts && posts.length > 0">
      <PostCard
        v-for="post in posts"
        :key="post.id"
        :reply="post"
      />
    </div>

    <div v-else class="text-center py-16 px-4 border-b border-gray-200 dark:border-gray-800">
      <UIcon name="i-heroicons-chat-bubble-left" class="w-12 h-12 mx-auto text-gray-400 mb-3 opacity-50" />
      <p class="text-sm text-gray-500 dark:text-gray-400">{{empty}}</p>
    </div>
  </div>
</template>

