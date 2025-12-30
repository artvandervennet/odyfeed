<script setup>
import { useAuthStore } from '~/stores/auth';
import { useActivityPub } from '~/composables/useActivityPub';

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

const auth = useAuthStore()
const { likePost, undoLikePost } = useActivityPub()

const actor = computed(() => props.post.actor)
const published = computed(() => new Date(props.post.published).toLocaleString())

const isLiked = computed(() => {
  if (!auth.isLoggedIn || !auth.user?.webId) return false;
  const webId = auth.user.webId;
  
  const likes = props.post.likes;
  if (!likes) return false;
  
  if (Array.isArray(likes)) {
    return likes.includes(webId);
  }
  
  if (likes.items) {
    return likes.items.includes(webId);
  }
  
  return false;
});

const likesCount = computed(() => {
  if (Array.isArray(props.post.likes)) return props.post.likes.length
  return props.post.likes?.totalItems || 0
})

const actorProfileUrl = computed(() => {
  if (!actor.value) return '#'
  const username = actor.value.preferredUsername || actor.value.id.split('/').pop()
  return `/actors/${username}`
})

async function handleLike() {
  if (isLiked.value) {
    await undoLikePost(props.post);
  } else {
    await likePost(props.post);
  }
}
</script>

<template>
  <UCard class="mb-4 overflow-hidden hover:ring-1 hover:ring-primary-500 transition-shadow">
    <template #header>
      <div class="flex items-center justify-between">
        <NuxtLink :to="actorProfileUrl" class="flex items-center gap-3 group">
          <UAvatar
            :src="actor?.icon?.url || actor?.avatar"
            :alt="actor?.name"
            size="sm"
          />
          <div class="flex flex-col">
            <span class="font-bold group-hover:text-primary-500 transition-colors">{{ actor?.name || 'Unknown' }}</span>
            <span class="text-xs text-gray-500">@{{ actor?.preferredUsername }}</span>
          </div>
        </NuxtLink>
        <span v-if="actor?.tone" class="text-xs italic text-gray-400">
          {{ actor.tone }}
        </span>
      </div>
    </template>

    <div class="prose prose-sm max-w-none dark:prose-invert">
      {{ post.content }}
    </div>

    <template #footer>
      <div class="flex items-center justify-between">
        <time class="text-xs text-gray-400">{{ published }}</time>
        <div class="flex gap-2">
          <UButton
            :icon="isLiked ? 'i-heroicons-heart-20-solid' : 'i-heroicons-heart'"
            size="xs"
            :color="isLiked ? 'primary' : 'gray'"
            variant="ghost"
            @click="handleLike"
          >
            {{ likesCount }}
          </UButton>
        </div>
      </div>
    </template>
  </UCard>
</template>
