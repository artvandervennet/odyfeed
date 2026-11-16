<script setup lang="ts">
interface Props {
  postsCount: number
  followersCount?: number
  followingCount?: number
}

defineProps<Props>()
</script>

<template>
  <p class="counts">
    <span><strong>{{ postsCount }}</strong> {{ postsCount === 1 ? 'Post' : 'Posts' }}</span>
    <span v-if="followersCount !== undefined">
      <strong>{{ followersCount }}</strong> {{ followersCount === 1 ? 'Follower' : 'Followers' }}
    </span>
    <span v-if="followingCount !== undefined"><strong>{{ followingCount }}</strong> Following</span>
  </p>
</template>
