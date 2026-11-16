<script setup lang="ts">
import {useAuthStore} from '~/stores/authStore'

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
  <!-- eslint-disable vue/no-deprecated-slot-attribute -- these are a custom element's native slots, not Vue 2 slots -->
  <!-- Gesso's sticky header. Links are places to go; what you can do sits in the actions slot.
       Everything slotted has to be a direct child of <art-header>. -->
  <art-header role="banner" label="Main" data-paint="deep">
    <NuxtLink slot="wordmark" to="/">OdyFeed</NuxtLink>
    <NuxtLink to="/about">About</NuxtLink>
    <NuxtLink v-if="auth.isLoggedIn" to="/inbox">Inbox</NuxtLink>
    <!-- on a narrow screen there is no room for the button below: the same link, in the menu -->
    <NuxtLink v-if="needsRegistration" to="/register" class="narrow-only">Complete profile</NuxtLink>

    <art-scheme slot="actions" remember/>

    <ActorMenu v-if="auth.isLoggedIn" slot="actions" :user-profile="auth.userProfile" @logout="logout"/>

    <art-button v-else-if="needsRegistration" slot="actions" size="s" class="wide-only">
      <NuxtLink to="/register">Complete profile</NuxtLink>
    </art-button>

    <LoginModal v-else slot="actions"/>
  </art-header>
</template>
