<script setup lang="ts">
import { useRepliesQuery } from '~/queries/replies'
import type { EnrichedPost } from '~~/shared/types/activitypub'
import { useLikeMutation, useUndoLikeMutation } from '~/mutations/like'
import { useReplyMutation } from '~/mutations/reply'
import { useInteractions } from '~/composables/usePost'
import { useAuthStore } from '~/stores/authStore'

const {post} = defineProps<{
  post: EnrichedPost
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

const {data: replies, isLoading: repliesLoading} = useRepliesQuery()(post)

const handleLike = async function () {
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

const toggleReplyForm = function () {
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
  <div>
    <div class="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <ActorInfo
          v-if="post.actor"
          :actor="post.actor"
          :show-tone="true"
          :clickable="true"
      />

      <div class="mt-4">
        <div
            class="prose prose-base max-w-none dark:prose-invert text-base leading-relaxed mb-4 whitespace-pre-wrap break-words">
          {{ post.content }}
        </div>
        <time class="text-sm text-gray-500 dark:text-gray-400">
          {{
            new Date(post.published!).toLocaleString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          }}
        </time>
      </div>

      <div class="flex items-center gap-6 py-4 border-y border-gray-200 dark:border-gray-800 mt-4">
        <div class="flex items-center gap-2">
          <span class="font-bold text-lg">{{ likesCount }}</span>
          <span class="text-gray-500 dark:text-gray-400 text-sm">{{ likesCount === 1 ? 'Like' : 'Likes' }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="font-bold text-lg">{{ repliesCount }}</span>
          <span class="text-gray-500 dark:text-gray-400 text-sm">{{ repliesCount === 1 ? 'Reply' : 'Replies' }}</span>
        </div>
      </div>

      <div class="flex items-center justify-around py-3 border-b border-gray-200 dark:border-gray-800">
        <UButton
            :icon="liked ? 'i-heroicons-heart-20-solid' : 'i-heroicons-heart'"
            size="md"
            :color="liked ? 'error' : 'neutral'"
            variant="ghost"
            :disabled="isLoading"
            @click="handleLike"
            class="flex-1"
        >
          {{ liked ? 'Unlike' : 'Like' }}
        </UButton>
        <UButton
            icon="i-heroicons-chat-bubble-left"
            size="md"
            color="neutral"
            variant="ghost"
            :disabled="isLoading"
            @click="toggleReplyForm"
            class="flex-1"
        >
          Reply
        </UButton>
      </div>
    </div>

    <div v-if="showReplyForm" class="p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
      <ReplyForm
          v-model="replyContent"
          placeholder="Post your reply..."
          @submit="handleReply"
          @cancel="toggleReplyForm"
      />
    </div>

    <div v-if="!showReplyForm && (replies && replies.length > 0)"
         class="px-4 py-3 bg-gray-50 dark:bg-gray-900/20 border-b border-gray-200 dark:border-gray-800">
      <h2 class="text-base font-bold text-gray-900 dark:text-gray-100">Replies</h2>
    </div>

    <ReplyList :replies="replies || []" :is-loading="repliesLoading"/>
  </div>
</template>

