<script setup lang="ts">
import {useAuthStore} from '~/stores/authStore'

const auth = useAuthStore()

const displayName = computed(() =>
    auth.userProfile?.name || auth.userProfile?.preferredUsername || 'Your Profile',
)

const username = computed(() =>
    auth.userProfile?.preferredUsername || auth.username || extractUsernameFromWebId(auth.webId),
)

const extractUsernameFromWebId = function (webId: string) {
  try {
    const url = new URL(webId)
    return url.hostname.split('.')[0] || 'user'
  } catch {
    return 'user'
  }
}
</script>

<template>
  <UContainer>
    <div class="max-w-2xl mx-auto py-8">
      <template v-if="!auth.isLoggedIn">
        <UCard class="text-center py-10">
          <UIcon name="i-heroicons-lock-closed" class="w-12 h-12 mx-auto text-gray-400 mb-4"/>
          <h2 class="text-xl font-bold mb-2">Authentication Required</h2>
          <p class="text-gray-500 dark:text-gray-400 mb-4">
            Please log in to view your profile.
          </p>
          <UButton to="/" color="primary">Go to Home</UButton>
        </UCard>
      </template>

      <template v-else>
        <UCard class="mb-8">
          <div class="flex items-start gap-6">
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

              <div class="mt-4 space-y-2">
                <div class="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-xs">
                  <p class="text-gray-600 dark:text-gray-400 break-all">
                    <strong>WebID:</strong> {{ auth.webId }}
                  </p>
                </div>
                <div v-if="auth.inbox" class="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-xs">
                  <p class="text-gray-600 dark:text-gray-400 break-all">
                    <strong>Inbox:</strong> {{ auth.inbox }}
                  </p>
                </div>
                <div v-if="auth.outbox" class="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-xs">
                  <p class="text-gray-600 dark:text-gray-400 break-all">
                    <strong>Outbox:</strong> {{ auth.outbox }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </UCard>

        <UCard>
          <h2 class="text-xl font-bold mb-4">Profile Information</h2>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between py-2 border-b border-gray-200 dark:border-gray-800">
              <span class="font-medium text-gray-600 dark:text-gray-400">Display Name</span>
              <span class="text-gray-900 dark:text-white">{{ auth.userProfile?.name || 'Not set' }}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-200 dark:border-gray-800">
              <span class="font-medium text-gray-600 dark:text-gray-400">Username</span>
              <span class="text-gray-900 dark:text-white">{{ auth.username }}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-200 dark:border-gray-800">
              <span class="font-medium text-gray-600 dark:text-gray-400">Preferred Username</span>
              <span class="text-gray-900 dark:text-white">{{ auth.userProfile?.preferredUsername || 'Not set' }}</span>
            </div>
            <div class="flex justify-between py-2">
              <span class="font-medium text-gray-600 dark:text-gray-400">Actor ID</span>
              <span class="text-gray-900 dark:text-white text-xs break-all text-right max-w-xs">{{
                  auth.actorId || 'Not set'
                }}</span>
            </div>
          </div>
        </UCard>
      </template>
    </div>
  </UContainer>
</template>
