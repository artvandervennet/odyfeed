<script setup lang="ts">
import {useAuthStore} from '~/stores/authStore';

const auth = useAuthStore();
const colorMode = useColorMode();

const isDark = computed({
  get() {
    return colorMode.value === 'dark'
  },
  set(_isDark) {
    colorMode.preference = _isDark ? 'dark' : 'light'
  }
})

const logout = async function () {
  await auth.logout();
  navigateTo('/');
};
</script>

<template>
  <header
      class="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
    <UContainer>
      <div class="flex h-16 items-center justify-between gap-3">
        <NuxtLink to="/" class="flex items-center gap-2.5 font-semibold text-lg hover:opacity-80 transition-opacity">
          <UIcon name="i-heroicons-sparkles" class="text-primary-500 w-5 h-5"/>
          <span class="text-gray-900 dark:text-white">OdyFeed</span>
        </NuxtLink>

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
              <UButton
              variant="ghost">
                <UAvatar
                    :src="auth.userProfile?.avatar || undefined"
                    :alt="auth.userProfile?.name || auth.userProfile?.preferredUsername || 'User'"
                    size="sm"
                    class="cursor-pointer ring-1 ring-gray-200 dark:ring-gray-800 hover:ring-primary-500 transition-all"
                />
              </UButton>


            </UDropdownMenu>
          </template>

          <LoginModal v-if="!auth.isLoggedIn"/>

        </div>
      </div>
    </UContainer>
  </header>


</template>
