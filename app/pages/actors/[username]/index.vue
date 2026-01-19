<script setup lang="ts">
import type { ASActor, ASNote, EnrichedPost } from '~~/shared/types/activitypub'
import { useAuthStore } from '~/stores/authStore'
import {fetchActor} from "~/api/actors";

const route = useRoute()
const username = route.params.username as string
const auth = useAuthStore()

const isOwnProfile = computed(() => auth.username === username)

const { data: actor, isLoading: actorLoading, error: actorError } = useQuery({
  key: queryKeys.actors.byUsername(username),
  query: () => fetchActor(username),
  staleTime: 1000 * 60 * 5,
})


const { data: actorPosts, isLoading: postsLoading } = useQuery({
  key: queryKeys.actors.posts(username),
  query: async () => {
    return await $fetch(`/api/actors/${username}/posts`, {
      headers: {
        'Accept': 'application/json',
      }
    })
  },
  staleTime: 1000 * 60 * 5,
  enabled: () => !!actor.value,
})


const enrichedPosts = computed(() => {
  if (!actorPosts.value || !actor.value) return []
  return actorPosts.value.map(post => ({
    ...post,
    actor: actor.value
  })) as EnrichedPost[]
})

const postsCount = computed(() => enrichedPosts.value?.length || 0)

useHead(() => ({
  title: actor.value ? `${actor.value.name} (@${actor.value.preferredUsername})` : 'Profile',
  meta: [
    {
      name: 'description',
      content: actor.value?.summary || `Profile of ${username}`
    }
  ]
}))
</script>

<template>
  <UContainer>
    <div class="max-w-4xl mx-auto">
      <template v-if="actorError || actor === null">
        <div class="text-center py-20">
          <UIcon name="i-heroicons-face-frown" class="w-20 h-20 mx-auto text-gray-400 mb-6" />
          <h2 class="text-3xl font-bold mb-4">Actor Not Found</h2>
          <p class="text-gray-500 dark:text-gray-400 mb-6">
            The profile you're looking for doesn't exist or has been removed.
          </p>
          <UButton to="/" color="primary" size="lg">
            <UIcon name="i-heroicons-arrow-left" class="mr-2" />
            Back to Timeline
          </UButton>
        </div>
      </template>

      <template v-else-if="actorLoading">
        <div class="space-y-6">
          <USkeleton class="h-48 w-full rounded-xl" />
          <div class="max-w-2xl mx-auto space-y-4">
            <USkeleton v-for="i in 3" :key="i" class="h-40 w-full rounded-lg" />
          </div>
        </div>
      </template>

      <template v-else-if="actor">
        <UCard class="mb-8 overflow-hidden">
          <ActorProfileHeader :actor="actor" :is-own-profile="isOwnProfile">
            <template #stats>
              <ActorProfileStats :posts-count="postsCount" />
            </template>
          </ActorProfileHeader>
        </UCard>

        <PostList
            small
          :posts="enrichedPosts"
          :is-loading="postsLoading"
          :empty="isOwnProfile ? `You haven't posted anything yet.` : `${username} hasn't posted anything yet.`"
        />
      </template>
    </div>
  </UContainer>
</template>

