<script setup lang="ts">
import { useQuery } from '@pinia/colada'
import { useAuthStore } from '~/stores/authStore'
import { useActivityPodsAuth } from '~/composables/useActivityPodsAuth'
import type { ASNote, ASCollection, EnrichedPost } from '~~/shared/types/activitypub'

const auth = useAuthStore()
const { fetchWithAuth } = useActivityPodsAuth()

const { isLoading: profileLoading, error: profileError } = useQuery({
  key: () => ['user-profile', auth.webId] as const,
  query: async () => {
    if (!auth.session || !auth.webId) {
      throw new Error('Not authenticated')
    }

    const response = await fetchWithAuth(auth.session, auth.webId)
    if (!response.ok) {
      throw new Error('Failed to fetch profile')
    }

    return await response.json()
  },
  enabled: () => auth.isLoggedIn && !!auth.webId,
  staleTime: 1000 * 60 * 5,
})

const { data: outboxData, isLoading: outboxLoading } = useQuery({
  key: () => ['user-outbox', auth.outbox || ''] as const,
  query: async () => {
    if (!auth.session || !auth.outbox) {
      throw new Error('Outbox not configured')
    }

    const response = await fetchWithAuth(auth.session, auth.outbox)
    if (!response.ok) {
      throw new Error('Failed to fetch outbox')
    }

    return await response.json() as ASCollection<string>
  },
  enabled: () => auth.isLoggedIn && !!auth.outbox,
  staleTime: 1000 * 60 * 2,
})

const { data: userPosts, isLoading: postsLoading } = useQuery({
  key: () => ['user-posts', auth.outbox || ''] as const,
  query: async () => {
    if (!auth.session || !outboxData.value) {
      return []
    }

    const postUrls = outboxData.value.orderedItems || outboxData.value.items || []

    const posts = await Promise.all(
      postUrls.map(async (url) => {
        try {
          const response = await fetchWithAuth(auth.session!, url)
          if (response.ok) {
            return await response.json()
          }
        } catch (error) {
          console.error('Failed to fetch post:', url, error)
        }
        return null
      })
    )

    return posts.filter(post => post && post.type === 'Note') as ASNote[]
  },
  enabled: () => !!outboxData.value && (outboxData.value.orderedItems?.length || 0) > 0,
  staleTime: 1000 * 60 * 2,
})

const enrichedPosts = computed(() => {
  if (!userPosts.value || !auth.userProfile) return []

  const actorProfile = {
    id: auth.webId,
    preferredUsername: auth.userProfile.preferredUsername || 'Unknown',
    name: auth.userProfile.name || auth.userProfile.preferredUsername || 'Unknown',
    summary: auth.userProfile.summary || '',
    tone: '',
    avatar: auth.userProfile.avatar || '',
    inbox: auth.inbox || '',
    outbox: auth.outbox || '',
  }

  return userPosts.value.map(post => ({
    ...post,
    actor: actorProfile
  })) as EnrichedPost[]
})

const displayName = computed(() =>
  auth.userProfile?.name || auth.userProfile?.preferredUsername || 'Your Profile'
)

const username = computed(() =>
  auth.userProfile?.preferredUsername || extractUsernameFromWebId(auth.webId)
)

const extractUsernameFromWebId = function (webId: string): string {
  try {
    const url = new URL(webId)
    return url.hostname.split('.')[0] || 'user'
  } catch {
    return 'user'
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <template v-if="!auth.isLoggedIn">
      <UCard class="text-center py-10">
        <UIcon name="i-heroicons-lock-closed" class="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h2 class="text-xl font-bold mb-2">Authentication Required</h2>
        <p class="text-gray-500 dark:text-gray-400 mb-4">
          Please log in to view your profile.
        </p>
        <UButton to="/" color="primary">Go to Home</UButton>
      </UCard>
    </template>

    <template v-else-if="profileError">
      <UCard class="text-center py-10">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-12 h-12 mx-auto text-red-400 mb-4" />
        <h2 class="text-xl font-bold mb-2">Error Loading Profile</h2>
        <p class="text-gray-500 dark:text-gray-400 mb-4">
          {{ profileError.message }}
        </p>
        <UButton to="/" color="neutral">Go to Home</UButton>
      </UCard>
    </template>

    <template v-else>
      <UCard class="mb-8">
        <div v-if="profileLoading" class="flex items-center gap-6">
          <USkeleton class="h-20 w-20 rounded-full" />
          <div class="flex-1 space-y-2">
            <USkeleton class="h-6 w-32" />
            <USkeleton class="h-4 w-24" />
            <USkeleton class="h-4 w-full" />
          </div>
        </div>

        <div v-else class="flex items-start gap-6">
          <ActorAvatar
            :avatar-url="auth.userProfile?.avatar"
            :username="username"
            size="lg"
          />
          <div class="flex-1">
            <div class="flex items-center justify-between mb-2">
              <h1 class="text-2xl font-bold">{{ displayName }}</h1>
              <UBadge color="primary" variant="subtle">
                Your Profile
              </UBadge>
            </div>
            <p class="text-gray-500 mb-4">@{{ username }}</p>
            <p v-if="auth.userProfile?.summary" class="text-sm dark:text-gray-300 mb-4">
              {{ auth.userProfile.summary }}
            </p>

            <div class="flex gap-4 text-sm">
              <div>
                <span class="font-bold">{{ enrichedPosts?.length || 0 }}</span>
                <span class="text-gray-500 ml-1">Posts</span>
              </div>
            </div>

            <div class="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-xs">
              <p class="text-gray-600 dark:text-gray-400 break-all">
                <strong>WebID:</strong> {{ auth.webId }}
              </p>
            </div>
          </div>
        </div>
      </UCard>

      <div class="space-y-4">
        <h2 class="text-xl font-bold mb-4 px-1">Your Posts</h2>

        <template v-if="postsLoading || outboxLoading">
          <USkeleton v-for="i in 3" :key="i" class="h-32 w-full" />
        </template>

        <template v-else>
          <PostCard
            v-for="post in enrichedPosts"
            :key="post.id"
            :post="post"
          />
          <UCard v-if="enrichedPosts.length === 0" class="text-center py-10 italic text-gray-500">
            You haven't posted anything yet.
          </UCard>
        </template>
      </div>
    </template>
  </div>
</template>
