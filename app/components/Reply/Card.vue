<script setup lang="ts">
import type { EnrichedPost } from '~~/shared/types/activitypub'
// import { useActivityPub } from '~/composables/useActivityPub'
// import { useInteractions } from '~/composables/usePost'

const {reply, level} = defineProps<{
  reply: EnrichedPost
  level?: number
}>()

// const { likePost, undoLikePost } = useActivityPub()
// const { isLiked, getLikesCount, getRepliesCount, getActorUsername, getPostId } = useInteractions()

const liked = computed(() => false)
const likesCount = computed(() => reply.likes?.totalItems || 0)
const repliesCount = computed(() => reply.replies?.totalItems || 0)

const postDetailUrl = computed(() => {
  const username = reply.actor?.preferredUsername
  const statusId = reply.id
  console.log("username:", username, " statusId: ", statusId)
  return `/actors/${username}/status/${statusId}`
})

const handleLike = async function () {
  // if (liked.value) {
  //   await undoLikePost(props.reply)
  // } else {
  //   await likePost(props.reply)
  // }
}
</script>

<template>
  <article
    class="p-4 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
    :class="{ 'pl-12 ml-4 border-l-2 border-gray-200 dark:border-gray-700': level && level > 0 }"
  >
    <div class="flex gap-3">
      <div @click.stop class="shrink-0">
        <NuxtLink :to="`/actors/${reply.actor?.preferredUsername}`">
          <ActorAvatar
            v-if="reply.actor"
            :avatar-url="reply.actor.avatar"
            :username="reply.actor.preferredUsername"
            size="sm"
          />
        </NuxtLink>
      </div>

      <div class="flex-1 min-w-0">
        <div @click.stop class="mb-2">
          <ActorInfo
            v-if="reply.actor"
            :actor="reply.actor"
            :show-tone="false"
            :clickable="true"
          />
        </div>

        <div
          class="mb-3 cursor-pointer"
          @click="navigateTo(postDetailUrl)"
        >
          <p class="text-sm prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap break-words">
            {{ reply.content }}
          </p>
          <time class="text-xs text-gray-500 mt-2 block">
            {{ new Date(reply.published!).toLocaleString('en-US', {
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
            @like="handleLike"
            @reply="navigateTo(postDetailUrl)"
          />
        </div>
      </div>
    </div>
  </article>
</template>

