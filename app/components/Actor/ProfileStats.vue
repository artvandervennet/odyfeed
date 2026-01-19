<script setup lang="ts">
interface Props {
  postsCount: number
  followersCount?: number
  followingCount?: number
}

defineProps<Props>()
</script>

<template>
  <div class="flex gap-6 mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
    <div class="flex items-baseline gap-1.5">
      <span class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ postsCount }}
      </span>
      <span class="text-sm text-gray-500 dark:text-gray-400">
        {{ postsCount === 1 ? 'Post' : 'Posts' }}
      </span>
    </div>

    <div v-if="followersCount !== undefined" class="flex items-baseline gap-1.5">
      <span class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ followersCount }}
      </span>
      <span class="text-sm text-gray-500 dark:text-gray-400">
        {{ followersCount === 1 ? 'Follower' : 'Followers' }}
      </span>
    </div>

    <div v-if="followingCount !== undefined" class="flex items-baseline gap-1.5">
      <span class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ followingCount }}
      </span>
      <span class="text-sm text-gray-500 dark:text-gray-400">
        Following
      </span>
    </div>
  </div>
</template>
