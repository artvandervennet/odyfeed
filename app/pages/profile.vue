<script setup lang="ts">
const auth = useAuth()
const { isLoggedIn, userProfile, webId, logout, inbox, outbox, actorId } = auth

const displayName = computed(() => userProfile.value?.name || userProfile.value?.preferredUsername || 'Your Profile')

const username = computed(() => userProfile.value?.preferredUsername || extractUsernameFromWebId(webId.value))

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
  <UContainer>
    <div class="max-w-2xl mx-auto py-8">
      <EmptyState
        v-if="!isLoggedIn"
        icon="i-heroicons-lock-closed"
        title="Authentication Required"
        description="Please log in to view your profile."
        action-label="Go to Home"
        action-to="/"
      />

      <template v-else>
        <UCard class="mb-8">
          <div class="flex items-start gap-6">
            <ActorAvatar :avatar-url="userProfile?.avatar" :username="username" size="lg" />
            <div class="flex-1">
              <div class="flex items-center justify-between mb-2">
                <h1 class="text-2xl font-bold">{{ displayName }}</h1>
                <UBadge color="primary" variant="subtle"> Your Profile </UBadge>
              </div>
              <p class="text-gray-500 mb-4">@{{ username }}</p>
              <p v-if="userProfile?.summary" class="text-sm dark:text-gray-300 mb-4">
                {{ userProfile.summary }}
              </p>

              <div class="mt-4 space-y-2">
                <div class="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-xs">
                  <p class="text-gray-600 dark:text-gray-400 break-all">
                    <strong>WebID:</strong> {{ webId }}
                  </p>
                </div>
                <div v-if="inbox" class="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-xs">
                  <p class="text-gray-600 dark:text-gray-400 break-all">
                    <strong>Inbox:</strong> {{ inbox }}
                  </p>
                </div>
                <div v-if="outbox" class="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-xs">
                  <p class="text-gray-600 dark:text-gray-400 break-all">
                    <strong>Outbox:</strong> {{ outbox }}
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
              <span class="text-gray-900 dark:text-white">{{ userProfile?.name || 'Not set' }}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-200 dark:border-gray-800">
              <span class="font-medium text-gray-600 dark:text-gray-400">Username</span>
              <span class="text-gray-900 dark:text-white">{{ username }}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-200 dark:border-gray-800">
              <span class="font-medium text-gray-600 dark:text-gray-400">Preferred Username</span>
              <span class="text-gray-900 dark:text-white">{{
                userProfile?.preferredUsername || 'Not set'
              }}</span>
            </div>
            <div class="flex justify-between py-2">
              <span class="font-medium text-gray-600 dark:text-gray-400">Actor ID</span>
              <span class="text-gray-900 dark:text-white text-xs break-all text-right max-w-xs">{{
                actorId || 'Not set'
              }}</span>
            </div>
          </div>
        </UCard>

        <UCard class="mt-4">
          <h2 class="text-lg font-bold mb-4 text-gray-900 dark:text-white">Account Actions</h2>
          <UButton
            color="error"
            variant="soft"
            icon="i-heroicons-arrow-right-on-rectangle"
            block
            @click="logout"
          >
            Logout
          </UButton>
        </UCard>
      </template>
    </div>
  </UContainer>
</template>
