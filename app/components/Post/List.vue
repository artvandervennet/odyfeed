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
  <div v-if="isLoading" class="stack" aria-busy="true">
    <span class="visually-hidden" role="status">Loading posts…</span>
    <div v-for="i in 3" :key="i" class="card post-skeleton">
      <span class="skeleton avatar"/>
      <span class="skeleton"/>
      <span class="skeleton"/>
      <span class="skeleton"/>
    </div>
  </div>

  <ul v-else-if="posts && posts.length > 0" class="stack">
    <li v-for="post in posts" :key="post.id">
      <PostCard v-if="!small" :post="post"/>
      <PostCard v-else :reply="post"/>
    </li>
  </ul>

  <p v-else class="empty">{{ empty }}</p>
</template>
