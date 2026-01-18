<script setup lang="ts">
import type { EnrichedPost } from '~~/shared/types/activitypub'
import { useLikeMutation, useUndoLikeMutation } from '~/mutations/like'
import { useAuthStore } from '~/stores/authStore'
import { isPostLikedByUser, getPostLikesCount, getPostRepliesCount, extractStatusIdFromPostUrl } from '~/utils/postHelpers'

const props = defineProps<{
  reply: EnrichedPost
  level?: number
}>()

const auth = useAuthStore()
const { getAvatarUrl } = useActorAvatar()
const likeMutation = useLikeMutation()
const undoLikeMutation = useUndoLikeMutation()

const liked = computed(() => isPostLikedByUser(props.reply, auth.webId))
const likesCount = computed(() => getPostLikesCount(props.reply))
const repliesCount = computed(() => getPostRepliesCount(props.reply))
const isLoading = computed(() =>
  likeMutation.status.value === 'pending' ||
  undoLikeMutation.status.value === 'pending'
)
const avatarUrl = computed(() => getAvatarUrl(props.reply.actor))

const postDetailUrl = computed(() => {
  const username = props.reply.actor?.preferredUsername
  const statusId = extractStatusIdFromPostUrl(props.reply.id)
  return `/actors/${username}/status/${statusId}`
})

const handleLike = async function (event: Event) {
  event.stopPropagation()

  if (!auth.isLoggedIn) {
    console.warn('User must be logged in to like posts')
    return
  }

  if (isLoading.value) return

  if (liked.value) {
    undoLikeMutation.mutate(props.reply)
  } else {
    likeMutation.mutate(props.reply)
  }
}

const handleReply = function (event: Event) {
  event.stopPropagation()
}
</script>

<template>
  <article
    class="p-4 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
    :class="{ 'pl-12 ml-4 border-l-2 border-gray-200 dark:border-gray-700': props.level && props.level > 0 }"
  >
    <div class="flex gap-3">
      <div @click.stop class="shrink-0">
        <NuxtLink :to="`/actors/${props.reply.actor?.preferredUsername}`">
          <ActorAvatar
            v-if="props.reply.actor"
            :avatar-url="avatarUrl"
            :username="props.reply.actor.preferredUsername"
            size="sm"
          />
        </NuxtLink>
      </div>

      <div class="flex-1 min-w-0">
        <div @click.stop class="mb-2">
          <ActorInfo
            v-if="props.reply.actor"
            :actor="props.reply.actor"
            :show-tone="false"
            :clickable="true"
          />
        </div>

        <div
          class="mb-3 cursor-pointer"
          @click="navigateTo(postDetailUrl)"
        >
          <p class="text-sm prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap break-words">
            {{ props.reply.content }}
          </p>
          <time class="text-xs text-gray-500 mt-2 block">
            {{ new Date(props.reply.published!).toLocaleString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              month: 'short',
              day: 'numeric'
            }) }}
          </time>
        </div>

        <div @click.stop>
          <PostStats
            :likes-count="likesCount"
            :replies-count="repliesCount"
            :is-liked="liked"
            :is-loading="isLoading"
            @like.stop="handleLike"
            @reply.stop="handleReply"
          />
        </div>
      </div>
    </div>
  </article>
</template>

