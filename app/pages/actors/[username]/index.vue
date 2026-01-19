<script setup lang="ts">
import { useQuery } from '@pinia/colada'
import { fetchActor } from '~/api/actors'
import type { EnrichedPost } from '~~/shared/types/activitypub'
import { useAuthStore } from '~/stores/authStore'
import { queryKeys } from '~/utils/queryKeys'

const route = useRoute()
const username = route.params.username as string
const auth = useAuthStore()

const { getAvatarUrl } = useActorAvatar()

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

const avatarUrl = computed(() => getAvatarUrl(actor.value))

const postsCount = computed(() => enrichedPosts.value?.length || 0)

const isLoading = computed(() => actorLoading.value || postsLoading.value)

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
          <div class="relative">
            <div class="h-32 sm:h-40 bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700" />

            <div class="px-4 sm:px-6 pb-6">
              <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-14 sm:-mt-16 relative">
                <div class="flex flex-col sm:flex-row sm:items-end gap-4">
                  <div class="relative w-24 h-24 sm:w-28 sm:h-28">
                    <UAvatar
                      :src="avatarUrl"
                      :alt="actor.preferredUsername"
                      size="lg"
                      class="w-full h-full ring-4 ring-white dark:ring-gray-900"
                    />
                  </div>

                  <div class="flex-1 pt-2">
                    <div class="flex items-center gap-2 mb-1 flex-wrap">
                      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                        {{ actor.name }}
                      </h1>
                      <UBadge v-if="isOwnProfile" color="primary" variant="subtle" size="sm">
                        Your Profile
                      </UBadge>
                      <UBadge v-else-if="actor.tone" color="neutral" variant="subtle" size="sm">
                        {{ actor.tone }}
                      </UBadge>
                    </div>
                    <p class="text-base text-gray-500 dark:text-gray-400">
                      @{{ actor.preferredUsername }}
                    </p>
                  </div>
                </div>

                <div v-if="isOwnProfile" class="flex justify-start sm:justify-end">
                  <UButton
                    to="/profile"
                    color="neutral"
                    variant="solid"
                    icon="i-heroicons-pencil-square"
                    size="md"
                  >
                    Edit Profile
                  </UButton>
                </div>
              </div>

              <div v-if="actor.summary" class="mt-6">
                <p class="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                  {{ actor.summary }}
                </p>
              </div>

              <div class="flex gap-6 mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                <div class="flex items-baseline gap-1.5">
                  <span class="text-2xl font-bold text-gray-900 dark:text-white">
                    {{ postsCount }}
                  </span>
                  <span class="text-sm text-gray-500 dark:text-gray-400">
                    {{ postsCount === 1 ? 'Post' : 'Posts' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </UCard>

        <div class="max-w-2xl mx-auto">
          <div class="flex items-center justify-between mb-6 px-1">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">Posts</h2>
          </div>

          <template v-if="postsLoading">
            <div class="space-y-4">
              <USkeleton v-for="i in 3" :key="i" class="h-40 w-full rounded-lg" />
            </div>
          </template>

          <template v-else-if="enrichedPosts.length > 0">
            <div class="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden divide-y divide-gray-200 dark:divide-gray-800">
              <PostCard
                v-for="post in enrichedPosts"
                :key="post.id"
                :post="post"
                class="border-0"
              />
            </div>
          </template>

          <template v-else>
            <UCard class="text-center py-12">
              <div class="flex flex-col items-center gap-4">
                <UIcon name="i-heroicons-document-text" class="w-16 h-16 text-gray-300 dark:text-gray-700" />
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No posts yet
                  </h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ isOwnProfile ? "You haven't posted anything yet." : `${actor.name} hasn't posted anything yet.` }}
                  </p>
                </div>
              </div>
            </UCard>
          </template>
        </div>
      </template>
    </div>
  </UContainer>
</template>

