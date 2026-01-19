<script setup lang="ts">
import {useAuthStore} from '~/stores/authStore'
import AuthActions from "~/components/molecules/AuthActions.vue";
import ThemeToggle from "~/components/molecules/ThemeToggle.vue";
import UserMenu from "~/components/molecules/UserMenu.vue";

const auth = useAuthStore()

const needsRegistration = computed(() => {
  return auth.isAuthenticated && !auth.isLoggedIn
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
          <ThemeToggle />

          <AuthActions :is-logged-in="auth.isLoggedIn" :needs-registration="needsRegistration">
            <template #user-menu>
              <UserMenu :user-profile="auth.userProfile" @logout="logout" />
            </template>
            <template #login-button>
              <LoginModal />
            </template>
          </AuthActions>
        </div>
      </div>
    </UContainer>
  </header>


</template>
