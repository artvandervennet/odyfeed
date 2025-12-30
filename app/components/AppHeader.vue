<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import {useColorMode} from "@vueuse/core";

const auth = useAuthStore();
const colorMode = useColorMode();

const isDark = computed({
  get () {
    return colorMode.value === 'dark'
  },
  set () {
    colorMode.value = colorMode.value === 'dark' ? 'light' : 'dark'
  }
})

const login = () => auth.solidLogin();
const logout = () => auth.session.logout();
</script>

<template>
  <header class="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/75 dark:bg-gray-900/75 backdrop-blur">
    <UContainer>
      <div class="flex h-16 items-center justify-between gap-3">
        <NuxtLink to="/" class="flex items-center gap-2 font-bold text-xl text-primary-500">
          <UIcon name="i-heroicons-sparkles" />
          OdyFeed
        </NuxtLink>

        <div class="flex items-center gap-4">
          <UButton
            :icon="isDark ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'"
            color="neutral"
            variant="ghost"
            aria-label="Theme"
            @click="isDark = !isDark"
          />

          <template v-if="auth.isLoggedIn">
            <NuxtLink v-if="!auth.inbox || !auth.outbox" to="/setup" class="hidden md:flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400 hover:underline">
              <UIcon name="i-heroicons-exclamation-triangle" />
              <span>Pod not ready (Setup)</span>
            </NuxtLink>
            <UDropdownMenu :items="[[{ label: auth.name || auth.user.webId, disabled: true }, { label: 'Setup Pod', icon: 'i-heroicons-cog-6-tooth', to: '/setup' }, { label: 'Logout', icon: 'i-heroicons-arrow-left-on-rectangle', onSelect: logout }]]">
              <UAvatar
                :src="auth.avatar || ''"
                :alt="auth.name || 'User'"
                size="sm"
                class="cursor-pointer"
              />
            </UDropdownMenu>
          </template>
          <UButton
            v-else
            label="Login with Pod"
            icon="i-heroicons-user-circle"
            @click="login"
          />
        </div>
      </div>
    </UContainer>
  </header>
</template>
