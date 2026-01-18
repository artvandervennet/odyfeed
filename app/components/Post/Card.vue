<script setup lang="ts">
import type { EnrichedPost } from '~~/shared/types/activitypub'
import { useLikeMutation, useUndoLikeMutation } from '~/mutations/like'
import { useReplyMutation } from '~/mutations/reply'
import { useAuthStore } from '~/stores/authStore'
import { isPostLikedByUser, getPostLikesCount, getPostRepliesCount, extractStatusIdFromPostUrl } from '~/utils/postHelpers'

const props = defineProps<{
  post: EnrichedPost
  showReplies?: boolean
  isDetailView?: boolean
}>()

const auth = useAuthStore()
const likeMutation = useLikeMutation()
const undoLikeMutation = useUndoLikeMutation()
const replyMutation = useReplyMutation()

const showReplyForm = ref(false)
const replyContent = ref('')

const liked = computed(() => isPostLikedByUser(props.post, auth.webId))
const likesCount = computed(() => getPostLikesCount(props.post))
const repliesCount = computed(() => getPostRepliesCount(props.post))

const postDetailUrl = computed(() => {
  const username = props.post.actor?.preferredUsername
  const statusId = extractStatusIdFromPostUrl(props.post.id)
  return `/actors/${username}/status/${statusId}`
})

const handleLike = async function (event: Event) {
  event.stopPropagation()

  if (!auth.isLoggedIn) {
    console.warn('User must be logged in to like posts')
    return
  }

  if (likeMutation.isLoading.value || undoLikeMutation.isLoading.value) return

  if (liked.value) {
    undoLikeMutation.mutate(props.post)
  } else {
    likeMutation.mutate(props.post)
  }
}

const handleReply = async function () {
  if (!replyContent.value.trim()) return

  if (!auth.isLoggedIn) {
    console.warn('User must be logged in to reply')
    return
  }

  replyMutation.mutate({ post: props.post, content: replyContent.value })
  replyContent.value = ''
  showReplyForm.value = false
}

const toggleReplyForm = function (event?: Event) {
  if (event) event.stopPropagation()

  if (!auth.isLoggedIn) {
    console.warn('User must be logged in to reply')
    return
  }

  showReplyForm.value = !showReplyForm.value
  if (!showReplyForm.value) {
    replyContent.value = ''
  }
}
</script>

<template>
  <article
      class="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors cursor-pointer p-4"
      @click.stop="navigateTo(postDetailUrl)">
    <div>
      <ActorInfo
          v-if="props.post.actor"
          :actor="props.post.actor"
          :show-tone="true"
          :clickable="true"
          @click.stop
      />
    </div>

    <div class="mt-3">
      <PostContent
          :content="props.post.content"
          :published="props.post.published!"
      />
    </div>

    <div v-if="showReplyForm" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <ReplyForm
          v-model="replyContent"
          @submit="handleReply"
          @cancel="() => toggleReplyForm()"
      />
    </div>

    <div class="mt-3">
      <PostStats
          :likes-count="likesCount"
          :replies-count="repliesCount"
          :is-liked="liked"
          @like.stop="handleLike"
          @reply.stop="toggleReplyForm"
      />
    </div>
  </article>
</template>
