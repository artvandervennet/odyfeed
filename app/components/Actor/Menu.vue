<script setup lang="ts">
import type {UserProfileResponse} from '~~/shared/types/api'

interface Props {
  userProfile: UserProfileResponse | null
  username?: string
}

// two root nodes (the button and the teleported menu): attributes such as slot="actions" go on the button
defineOptions({inheritAttrs: false})

const props = defineProps<Props>()

const emit = defineEmits<{
  logout: []
}>()

const displayName = computed(
    () => props.userProfile?.name || props.userProfile?.preferredUsername || 'My Account',
)

// Gesso's .menu on the popover API: the browser opens and closes it, and gives it Escape and
// click-outside. It only has to be closed by hand after picking something in it.
const menu = ref<HTMLElement | null>(null)

const close = function () {
  menu.value?.hidePopover()
}

const logout = function () {
  close()
  emit('logout')
}
</script>

<template>
  <button
      type="button"
      class="avatar-button"
      popovertarget="account-menu"
      aria-label="Account menu"
      style="anchor-name: --account-menu"
      v-bind="$attrs"
  >
    <ActorAvatar :avatar-url="userProfile?.avatar || undefined" :username="displayName" size="sm"/>
  </button>

  <!-- on <body>, so it takes the page's colours and not the header's paint -->
  <Teleport to="body">
    <div
        id="account-menu"
        ref="menu"
        class="menu anchored end"
        popover
        style="position-anchor: --account-menu"
    >
      <p class="menu-label">{{ displayName }}</p>
      <hr>
      <NuxtLink to="/profile" @click="close">
        <Icon name="i-heroicons-user-circle" aria-hidden="true"/>
        View profile
      </NuxtLink>
      <NuxtLink to="/setup" @click="close">
        <Icon name="i-heroicons-cog-6-tooth" aria-hidden="true"/>
        Set up Pod
      </NuxtLink>
      <hr>
      <button type="button" @click="logout">
        <Icon name="i-heroicons-arrow-right-on-rectangle" aria-hidden="true"/>
        Log out
      </button>
    </div>
  </Teleport>
</template>
