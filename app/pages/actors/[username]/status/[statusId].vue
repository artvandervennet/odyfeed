<script setup lang="ts">
import { useQuery } from '@pinia/colada'
import { usePostQuery } from '~/queries/post'
import { fetchActor } from '~/api/actors'
import type { EnrichedPost } from '~~/shared/types/activitypub'

const route = useRoute()
const username = route.params.username as string
const statusId = route.params.statusId as string

const { data: post, isLoading, error } = usePostQuery()(username, statusId)

const { data: actor } = useQuery<ASActor>({
  key: ['actor', username],
  query: () => fetchActor(username),
})

const enrichedPost = computed(() => {
  if (!post.value || !actor.value) return null

  return {
    ...post.value,
    actor: actor.value,
  } as EnrichedPost
})

const baseUrl = window?.location.origin || ''
const postUrl = computed(() => {
  return `${baseUrl}/actors/${username}/status/${statusId}`
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
          @click="$router.back()"
      >
        Back
      </UButton>
    </div>

    <div v-if="isLoading" class="p-4 space-y-4">
      <div class="flex gap-3">
        <USkeleton class="w-12 h-12 rounded-full"/>
        <div class="flex-1 space-y-3">
          <USkeleton class="h-4 w-32"/>
          <USkeleton class="h-20 w-full"/>
          <USkeleton class="h-4 w-3/4"/>
        </div>
      </div>
    </div>

    <div v-else-if="error" class="text-center py-20 px-4">
      <UIcon name="i-heroicons-exclamation-circle" class="w-12 h-12 mx-auto text-red-500 mb-4"/>
      <h2 class="text-2xl font-bold mb-2">Post not found</h2>
      <p class="text-gray-500 mb-4">The post you're looking for doesn't exist or has been removed.</p>
      <UButton @click="$router.push('/')">Go to Timeline</UButton>
    </div>

    <PostDetail v-else-if="enrichedPost" :post="enrichedPost" />
  </div>
</template>

