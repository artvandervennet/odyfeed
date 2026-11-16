<script setup lang="ts">
import { useInboxQuery } from '~/queries/inbox'
import { useAuthStore } from '~/stores/authStore'
import type { ASActivity } from '~~/shared/types/activitypub'
import EmptyState from '~/components/atoms/EmptyState.vue'
import LoadingCard from '~/components/atoms/LoadingCard.vue'

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

// Arrow keys, Home and End move between the tabs and select the one they land on.
const onTabKey = function (event: KeyboardEvent) {
  const last = tabs.length - 1
  let next = activeTab.value
  if (event.key === 'ArrowRight') next = activeTab.value === last ? 0 : activeTab.value + 1
  else if (event.key === 'ArrowLeft') next = activeTab.value === 0 ? last : activeTab.value - 1
  else if (event.key === 'Home') next = 0
  else if (event.key === 'End') next = last
  else return

  event.preventDefault()
  activeTab.value = next
  nextTick(() => document.getElementById(`inbox-tab-${tabs[next]?.key}`)?.focus())
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
  <div>
    <div class="band page-head" data-paint="deep">
      <div class="inner">
        <h1>Inbox</h1>
        <p class="lead">Your ActivityPub notifications and interactions</p>
      </div>
      <art-drip class="band-drip" pigment="--surface" seed="inbox" count="9" stagger flush/>
    </div>

    <div class="band" data-paint="1">
      <div class="inner narrow">
        <EmptyState
          v-if="!auth.isLoggedIn"
          title="Authentication Required"
          description="Please log in to view your inbox."
          action-label="Go to Home"
          action-to="/"
        />

        <template v-else>
          <!-- Tabs, as the ARIA pattern has them: one tab stop, arrow keys move between tabs -->
          <div class="tabs" role="tablist" aria-label="Filter activities" @keydown="onTabKey">
            <button
              v-for="tab in tabs"
              :id="`inbox-tab-${tab.key}`"
              :key="tab.key"
              type="button"
              role="tab"
              :aria-selected="activeTab === tab.value"
              aria-controls="inbox-panel"
              :tabindex="activeTab === tab.value ? 0 : -1"
              @click="activeTab = tab.value"
            >
              {{ tab.label }}
              <span v-if="tab.count.value > 0" class="tab-count">{{ tab.count.value }}</span>
            </button>
          </div>

          <div
            id="inbox-panel"
            role="tabpanel"
            :aria-labelledby="`inbox-tab-${tabs[activeTab]?.key}`"
            tabindex="0"
            class="tab-panel"
          >
            <LoadingCard v-if="isLoading" :count="5"/>

            <div v-else-if="error" class="card empty" role="alert">
              <h2>Error loading inbox</h2>
              <p>{{ error.message }}</p>
            </div>

            <div v-else-if="displayedActivities.length === 0" class="card empty">
              <art-splatter size="6rem" seed="inbox"/>
              <h2>No activities yet</h2>
              <p>Your inbox is empty. Start interacting with others to see activities here!</p>
            </div>

            <ul v-else class="stack">
              <li v-for="activity in displayedActivities" :key="activity.id" class="card activity">
                <span class="avatar small" aria-hidden="true">
                  <Icon :name="getActivityIcon(activity.type)"/>
                </span>
                <div class="activity-text">
                  <p>
                    <strong>{{ getActorName(activity.actor) }}</strong>
                    {{ activity.type === 'Like' ? 'liked your post' : '' }}
                    {{ activity.type === 'Follow' ? 'started following you' : '' }}
                    {{ activity.type === 'Create' ? 'replied to your post' : '' }}
                    {{ activity.type === 'Accept' ? 'accepted your follow request' : '' }}
                    <span class="activity-date">{{ formatActivityDate(activity.published) }}</span>
                  </p>

                  <template v-if="activity.object">
                    <blockquote
                      v-if="typeof activity.object === 'object' && 'content' in activity.object && activity.object.content"
                    >
                      {{ activity.object.content }}
                    </blockquote>
                    <NuxtLink v-else-if="typeof activity.object === 'string'" :to="activity.object">
                      View object
                    </NuxtLink>
                  </template>
                </div>
              </li>
            </ul>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
