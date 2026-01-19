<script setup lang="ts">
import { usePostQuery } from '~/queries/post'

const route = useRoute()
const statusId = route.params.statusId as string

const { data: post, isLoading, error } = usePostQuery()(statusId)

const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
const postUrl = computed(() => {
  return `${baseUrl}/status/${statusId}`
})

useHead({
  title: () => post.value ? `${post.value.content.slice(0, 50)}... - OdyFeed` : 'Post - OdyFeed',
  link: [
    {
      rel: 'webmention',
      href: `${baseUrl}/api/webmention`,
    },
  ],
  meta: [
    {
      property: 'og:type',
      content: 'article',
    },
    {
      property: 'og:url',
      content: postUrl.value,
    },
    {
      property: 'og:title',
      content: () => post.value?.content.slice(0, 100) || 'Post',
    },
  ],
})
</script>

<template>
  <div class="max-w-2xl mx-auto border-x border-gray-200 dark:border-gray-800 min-h-screen">
    <div
        class="top-14 z-10 bg-white/95 dark:bg-gray-950/95 backdrop-blur border-b border-gray-200 dark:border-gray-800 px-4 py-3">
      <UButton
          icon="i-heroicons-arrow-left"
          color="secondary"
          variant="ghost"
          size="sm"
          @click="navigateTo('/')"
      >
        Back to Timeline
      </UButton>
    </div>

    <div v-if="isLoading" class="p-4">
      <div class="space-y-4">
        <div class="flex gap-3">
          <USkeleton class="w-12 h-12 rounded-full shrink-0" />
          <div class="flex-1 space-y-2">
            <USkeleton class="h-4 w-32" />
            <USkeleton class="h-4 w-24" />
          </div>
        </div>
        <USkeleton class="h-20 w-full" />
      </div>
    </div>

    <div v-else-if="error" class="p-8 text-center">
      <UIcon name="i-heroicons-exclamation-circle" class="w-16 h-16 mx-auto text-red-500 mb-4" />
      <h2 class="text-xl font-bold mb-2">Post Not Found</h2>
      <p class="text-gray-500 dark:text-gray-400 mb-4">The post you're looking for doesn't exist or has been removed.</p>
      <UButton @click="navigateTo('/')">Go to Timeline</UButton>
    </div>

    <div v-else-if="post">
      <PostDetail :post="post" />
    </div>
  </div>
</template>
