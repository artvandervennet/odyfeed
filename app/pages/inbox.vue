<script setup lang="ts">
import { useInboxQuery } from '~/queries/inbox'
import { useAuthStore } from '~/stores/authStore'
import type { ASActivity } from '~~/shared/types/activitypub'

const auth = useAuthStore()
const { data: activities, isLoading, error } = useInboxQuery()

const groupedActivities = computed(() => {
  if (!activities.value) return { likes: [], follows: [], creates: [], others: [] }

  return activities.value.reduce((acc, activity) => {
    switch (activity.type) {
      case 'Like':
        acc.likes.push(activity)
        break
      case 'Follow':
        acc.follows.push(activity)
        break
      case 'Create':
        acc.creates.push(activity)
        break
      default:
        acc.others.push(activity)
    }
    return acc
  }, { likes: [] as ASActivity[], follows: [] as ASActivity[], creates: [] as ASActivity[], others: [] as ASActivity[] })
})

const activeTab = ref(0)
const tabs = [
  { key: 'all', label: 'All', value: 0, count: computed(() => activities.value?.length || 0) },
  { key: 'likes', label: 'Likes', value: 1, count: computed(() => groupedActivities.value.likes.length) },
  { key: 'follows', label: 'Follows', value: 2, count: computed(() => groupedActivities.value.follows.length) },
  { key: 'replies', label: 'Replies', value: 3, count: computed(() => groupedActivities.value.creates.length) },
]

const displayedActivities = computed(() => {
  const tabKey = tabs[activeTab.value]?.key
  if (tabKey === 'all') return activities.value || []
  if (tabKey === 'likes') return groupedActivities.value.likes
  if (tabKey === 'follows') return groupedActivities.value.follows
  if (tabKey === 'replies') return groupedActivities.value.creates
  return []
})

const getActivityIcon = function (type: string): string {
  switch (type) {
    case 'Like': return 'i-heroicons-heart-20-solid'
    case 'Follow': return 'i-heroicons-user-plus'
    case 'Create': return 'i-heroicons-chat-bubble-left'
    case 'Accept': return 'i-heroicons-check-circle'
    case 'Announce': return 'i-heroicons-arrow-path'
    default: return 'i-heroicons-bell'
  }
}

const getActivityColor = function (type: string): string {
  switch (type) {
    case 'Like': return 'error'
    case 'Follow': return 'primary'
    case 'Create': return 'secondary'
    case 'Accept': return 'success'
    default: return 'neutral'
  }
}

const formatActivityDate = function (date?: string): string {
  if (!date) return ''
  const activityDate = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - activityDate.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return activityDate.toLocaleDateString()
}

const getActorName = function (actor: string | any): string {
  if (typeof actor === 'string') {
    return actor.split('/').pop() || 'Unknown'
  }
  return actor?.preferredUsername || actor?.name || 'Unknown'
}
</script>

<template>
  <UContainer>
    <div class="max-w-2xl mx-auto">
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-4">
          <UIcon name="i-heroicons-inbox" class="w-8 h-8 text-primary-500" />
          <h1 class="text-3xl font-bold">Inbox</h1>
        </div>
        <p class="text-gray-500 dark:text-gray-400">
          Your ActivityPub notifications and interactions
        </p>
      </div>

      <template v-if="!auth.isLoggedIn">
        <UCard class="text-center py-10">
          <UIcon name="i-heroicons-lock-closed" class="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h2 class="text-xl font-bold mb-2">Authentication Required</h2>
          <p class="text-gray-500 dark:text-gray-400 mb-4">
            Please log in to view your inbox.
          </p>
          <UButton to="/" color="primary">Go to Home</UButton>
        </UCard>
      </template>

      <template v-else>
        <UTabs v-model="activeTab" :items="tabs" class="mb-6">
          <template #default="{ item }">
            <div class="flex items-center gap-2">
              <span>{{ item.label }}</span>
              <UBadge v-if="item.count.value > 0" size="xs" color="primary" variant="subtle">
                {{ item.count.value }}
              </UBadge>
            </div>
          </template>
        </UTabs>

        <div v-if="isLoading" class="space-y-3">
          <USkeleton v-for="i in 5" :key="i" class="h-20 w-full" />
        </div>

        <div v-else-if="error" class="text-center py-10">
          <UIcon name="i-heroicons-exclamation-circle" class="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h2 class="text-xl font-bold mb-2">Error loading inbox</h2>
          <p class="text-gray-500 dark:text-gray-400">
            {{ error.message }}
          </p>
        </div>

        <div v-else-if="displayedActivities.length === 0" class="text-center py-10">
          <UIcon name="i-heroicons-inbox" class="w-16 h-16 mx-auto text-gray-400 mb-4 opacity-50" />
          <h2 class="text-xl font-bold mb-2">No activities yet</h2>
          <p class="text-gray-500 dark:text-gray-400">
            Your inbox is empty. Start interacting with others to see activities here!
          </p>
        </div>

        <UCard v-else class="divide-y divide-gray-200 dark:divide-gray-800">
          <div
            v-for="activity in displayedActivities"
            :key="activity.id"
            class="p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
          >
            <div class="flex gap-3">
              <div class="shrink-0">
                <UIcon
                  :name="getActivityIcon(activity.type)"
                  :class="`w-10 h-10 text-${getActivityColor(activity.type)}-500`"
                />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2 mb-1">
                  <div class="flex-1">
                    <span class="font-semibold">{{ getActorName(activity.actor) }}</span>
                    <span class="text-gray-500 dark:text-gray-400 ml-2">
                      {{ activity.type === 'Like' ? 'liked your post' : '' }}
                      {{ activity.type === 'Follow' ? 'started following you' : '' }}
                      {{ activity.type === 'Create' ? 'replied to your post' : '' }}
                      {{ activity.type === 'Accept' ? 'accepted your follow request' : '' }}
                    </span>
                  </div>
                  <span class="text-xs text-gray-400 shrink-0">
                    {{ formatActivityDate(activity.published) }}
                  </span>
                </div>

                <div v-if="activity.object" class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <template v-if="typeof activity.object === 'object' && 'content' in activity.object && activity.object.content">
                    <div class="p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs line-clamp-2">
                      {{ activity.object.content }}
                    </div>
                  </template>
                  <template v-else-if="typeof activity.object === 'string'">
                    <NuxtLink :to="activity.object" class="text-primary-500 hover:underline text-xs">
                      View object
                    </NuxtLink>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </UCard>
      </template>
    </div>
  </UContainer>
</template>
