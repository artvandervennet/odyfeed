<script setup lang="ts">
import type { EnrichedPost } from '~~/shared/types/activitypub'
import { useLikeMutation, useUndoLikeMutation } from '~/mutations/like'
import { useReplyMutation } from '~/mutations/reply'
import { useInteractions } from '~/composables/usePost'
import { useAuthStore } from '~/stores/authStore'

const {post, showReplies, isDetailView} = defineProps<{
  post: EnrichedPost
  showReplies?: boolean
  isDetailView?: boolean
}>()

const auth = useAuthStore()
const { isLiked } = useInteractions()
const likeMutation = useLikeMutation()
const undoLikeMutation = useUndoLikeMutation()
const replyMutation = useReplyMutation()

const showReplyForm = ref(false)
const replyContent = ref('')

const liked = computed(() => isLiked(post))
const likesCount = computed(() => post.likes?.totalItems || 0)
const repliesCount = computed(() => post.replies?.totalItems || 0)
const isLoading = computed(() =>
  likeMutation.status.value === 'pending' ||
  undoLikeMutation.status.value === 'pending' ||
  replyMutation.status.value === 'pending'
)

const postDetailUrl = computed(() => {
  const username = post.actor?.preferredUsername
  const statusId = post.id.split('/').pop()
  console.log("username:", username, " statusId: ", statusId)
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
    undoLikeMutation.mutate(post)
  } else {
    likeMutation.mutate(post)
  }
}

const handleReply = async function () {
  if (!replyContent.value.trim()) return

  if (!auth.isLoggedIn) {
    console.warn('User must be logged in to reply')
    return
  }

  replyMutation.mutate({ post, content: replyContent.value })
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
  <article class="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors cursor-pointer p-4" @click.stop="navigateTo(postDetailUrl)" >
    <div>
      <ActorInfo
        v-if="post.actor"
        :actor="post.actor"
        :show-tone="true"
        :clickable="true"
        @click.stop
      />
    </div>

    <div class="mt-3">
      <PostContent
        :content="post.content"
        :published="post.published!"
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
        :is-loading="isLoading"
        @like.stop="handleLike"
        @reply.stop="toggleReplyForm"
      />
    </div>
  </article>
</template>
