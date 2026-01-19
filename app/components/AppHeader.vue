<script setup lang="ts">
import {useAuthStore} from '~/stores/authStore'

const auth = useAuthStore()
const colorMode = useColorMode()

const needsRegistration = computed(() => {
  return auth.isAuthenticated && !auth.isLoggedIn
})

const isDark = computed({
  get() {
    return colorMode.value === 'dark'
  },
  set(_isDark) {
    colorMode.preference = _isDark ? 'dark' : 'light'
  },
})

const logout = async function () {
  console.log('logging out')
  await auth.logout()
  window.location.href = '/'
}
</script>

<template>
  <header
      class="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
    <UContainer>
      <div class="flex h-16 items-center justify-between gap-3">
        <div class="flex items-center gap-6">
          <NuxtLink to="/" class="flex items-center gap-2.5 font-semibold text-lg hover:opacity-80 transition-opacity">
            <UIcon name="i-heroicons-sparkles" class="text-primary-500 w-5 h-5"/>
            <span class="text-gray-900 dark:text-white">OdyFeed</span>
          </NuxtLink>

          <nav class="hidden sm:flex items-center gap-4">
            <NuxtLink
                to="/about"
                class="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              About
            </NuxtLink>
          </nav>
        </div>

        <div class="flex items-center gap-3">
          <ClientOnly v-if="!colorMode?.forced">
            <UButton
                :icon="isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
                color="neutral"
                variant="ghost"
                :aria-label="`Switch to ${isDark ? 'light' : 'dark'} mode`"
                @click="isDark = !isDark"
            />
          </ClientOnly>

          <template v-if="auth.isLoggedIn">
            <UButton
                to="/inbox"
                icon="i-heroicons-inbox"
                color="neutral"
                variant="ghost"
                aria-label="Inbox"
            />
            <UDropdownMenu
                :items="[
                [
                  { label: auth.userProfile?.name || auth.userProfile?.preferredUsername || 'My Account', icon: 'i-heroicons-user', disabled: true }
                ],
                [
                  { label: 'View Profile', icon: 'i-heroicons-user-circle', to: '/profile' },
                  { label: 'Setup Pod', icon: 'i-heroicons-cog-6-tooth', to: '/setup' }
                ],
                [
                  { label: 'Logout', icon: 'i-heroicons-arrow-right-on-rectangle', click: logout }
                ]
              ]"
            >
              <UButton variant="ghost">
                <UAvatar
                    :src="auth.userProfile?.avatar || undefined"
                    :alt="auth.userProfile?.name || auth.userProfile?.preferredUsername || 'User'"
                    size="sm"
                    class="cursor-pointer ring-1 ring-gray-200 dark:ring-gray-800 hover:ring-primary-500 transition-all"
                />
              </UButton>
            </UDropdownMenu>
          </template>

          <template v-else-if="needsRegistration">
            <UButton
                label="Complete Profile"
                icon="i-heroicons-user-plus"
                size="sm"
                color="primary"
                to="/register"
            />
          </template>

          <template v-else>
            <LoginModal/>
          </template>

        </div>
      </div>
    </UContainer>
  </header>


</template>
