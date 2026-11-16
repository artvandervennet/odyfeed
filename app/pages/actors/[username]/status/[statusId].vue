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
  <div>
    <div class="band page-head compact" data-paint="deep">
      <div class="inner narrow">
        <h1>Post</h1>
        <art-button variant="secondary" size="s">
          <button type="button" @click="$router.back()">
            <Icon name="i-heroicons-arrow-left" aria-hidden="true"/>
            Back
          </button>
        </art-button>
      </div>
      <art-drip class="band-drip" pigment="--surface" seed="post" count="9" stagger flush/>
    </div>

    <div class="band" data-paint="1">
      <div class="inner narrow">
        <div v-if="isLoading" class="stack" aria-busy="true">
          <span class="visually-hidden" role="status">Loading post…</span>
          <div class="card post-skeleton">
            <span class="skeleton avatar"/>
            <span class="skeleton"/>
            <span class="skeleton"/>
            <span class="skeleton"/>
          </div>
        </div>

        <div v-else-if="error" class="card empty" role="alert">
          <art-splatter size="6rem" seed="post"/>
          <h2>Post not found</h2>
          <p>The post you're looking for doesn't exist or has been removed.</p>
          <art-button>
            <NuxtLink to="/">Go to Timeline</NuxtLink>
          </art-button>
        </div>

        <PostDetail v-else-if="enrichedPost" :post="enrichedPost" />
      </div>
    </div>
  </div>
</template>
