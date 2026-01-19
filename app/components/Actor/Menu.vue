<script setup lang="ts">
import type {UserProfileResponse} from '~~/shared/types/api'

interface Props {
  userProfile: UserProfileResponse | null
  username?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  logout: []
}>()

const displayName = computed(
    () => props.userProfile?.name || props.userProfile?.preferredUsername || 'My Account',
)

const menuItems = computed(() => [
  [{label: displayName.value, icon: 'i-heroicons-user', disabled: true}],
  [
    {label: 'View Profile', icon: 'i-heroicons-user-circle', to: '/profile'},
    {label: 'Setup Pod', icon: 'i-heroicons-cog-6-tooth', to: '/setup'},
  ],
  [
    {
      label: 'Logout',
      icon: 'i-heroicons-arrow-right-on-rectangle',
      onSelect: () => emit('logout'),
    },
  ],
])
</script>

<template>
  <UDropdownMenu :items="menuItems">
    <UButton variant="ghost">
      <UAvatar
          :src="userProfile?.avatar || undefined"
          :alt="displayName"
          size="sm"
          class="cursor-pointer ring-1 ring-gray-200 dark:ring-gray-800 hover:ring-primary-500 transition-all"
      />
    </UButton>
  </UDropdownMenu>
</template>
