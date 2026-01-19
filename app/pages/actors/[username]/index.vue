<script setup lang="ts">
import { useQuery } from '@pinia/colada'
import { fetchActor, fetchActorOutbox, fetchNoteByUrl } from '~/api/actors'
import type { EnrichedPost } from '~~/shared/types/activitypub'
import { useAuthStore } from '~/stores/authStore'
import { queryKeys } from '~/utils/queryKeys'

const route = useRoute()
const username = route.params.username as string
const auth = useAuthStore()

const { getAvatarUrl } = useActorAvatar()

const isOwnProfile = computed(() => auth.username === username)

const { data: actor } = useQuery({
  key: queryKeys.actors.byUsername(username),
  query: () => fetchActor(username)
})

const { data: outbox } = useQuery({
  key: queryKeys.actors.outbox(username),
  query: () => fetchActorOutbox(username)
})

const { data: actorPosts, isLoading: postsLoading } = useQuery({
  key: queryKeys.actors.posts(username),
  query: async () => {
    const outboxData = await fetchActorOutbox(username)
    if (!outboxData?.orderedItems) return []

    const posts = await Promise.all(
      outboxData.orderedItems.map(url => fetchNoteByUrl(url))
    )

    return posts.filter(post => post.type === 'Note') as EnrichedPost[]
  },
  staleTime: 1000 * 60 * 5,
})

const enrichedPosts = computed(() => {
  if (!actorPosts.value || !actor.value) return []
  return actorPosts.value.map(post => ({
    ...post,
    actor: actor.value
  })) as EnrichedPost[]
})

const avatarUrl = computed(() => getAvatarUrl(actor.value))
</script>

<template>
    <div v-if="actor" class="max-w-2xl mx-auto">
      <UCard class="mb-8">
        <div class="flex items-start gap-6">
          <ActorAvatar
              :avatar-url="avatarUrl"
              :username="actor.preferredUsername"
              size="lg"
          />
          <div class="flex-1">
            <div class="flex items-center justify-between mb-2">
              <h1 class="text-2xl font-bold">{{ actor.name }}</h1>
              <div class="flex items-center gap-2">
                <UBadge v-if="isOwnProfile" color="primary" variant="subtle">
                  Your Profile
                </UBadge>
                <UBadge v-else-if="actor.tone" color="neutral" variant="subtle">
                  {{ actor.tone }}
                </UBadge>
                <UButton
                  v-if="isOwnProfile"
                  to="/profile"
                  size="sm"
                  color="neutral"
                  variant="ghost"
                  icon="i-heroicons-pencil-square"
                >
                  Edit
                </UButton>
              </div>
            </div>
            <p class="text-gray-500 mb-4">@{{ actor.preferredUsername }}</p>
            <p v-if="actor.summary" class="text-sm dark:text-gray-300">
              {{ actor.summary }}
            </p>

            <div class="flex gap-4 mt-6 text-sm">
              <div>
                <span class="font-bold">{{ enrichedPosts?.length || 0 }}</span>
                <span class="text-gray-500 ml-1">Posts</span>
              </div>
            </div>
          </div>
        </div>
      </UCard>

      <div class="space-y-4">
        <h2 class="text-xl font-bold mb-4 px-1">Posts</h2>
        <template v-if="postsLoading">
          <USkeleton v-for="i in 3" :key="i" class="h-32 w-full" />
        </template>
        <template v-else>
          <PostCard
            v-for="post in enrichedPosts"
            :key="post.id"
            :post="post"
          />
          <UCard v-if="enrichedPosts.length === 0" class="text-center py-10 italic text-gray-500">
            No posts from this actor yet.
          </UCard>
        </template>
      </div>
    </div>
    <div v-else-if="actor === null" class="text-center py-20">
      <UIcon name="i-heroicons-face-frown" class="w-16 h-16 mx-auto text-gray-400 mb-4" />
      <h2 class="text-2xl font-bold">Actor not found</h2>
      <UButton to="/" class="mt-4" color="neutral">Back to Timeline</UButton>
    </div>
    <div v-else class="max-w-2xl mx-auto space-y-4">
      <USkeleton class="h-40 w-full" />
      <USkeleton v-for="i in 3" :key="i" class="h-32 w-full" />
    </div>
</template>

