<script setup lang="ts">
interface Props {
  isLoggedIn: boolean
  needsRegistration: boolean
}

defineProps<Props>()
</script>

<template>
  <div class="flex items-center gap-3">
    <template v-if="isLoggedIn">
      <UButton
          to="/inbox"
          icon="i-heroicons-inbox"
          color="neutral"
          variant="ghost"
          aria-label="Inbox"
      />
      <slot name="user-menu"/>
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
      <slot name="login-button"/>
    </template>
  </div>
</template>
