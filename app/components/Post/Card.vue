<script setup lang="ts">
import type { EnrichedPost } from '~~/shared/types/activitypub'
import { useAuthStore } from '~/stores/authStore'
import { usePostActions } from '~/composables/usePostActions'

const props = defineProps<{
  post: EnrichedPost
  showReplies?: boolean
  isDetailView?: boolean
}>()

const auth = useAuthStore()

const showReplyForm = ref(false)
const replyContent = ref('')

const postComputed = computed(() => props.post)
const {
  liked,
  likesCount,
  repliesCount,
  isLikeLoading,
  isReplyLoading,
  handleLike,
  handleReply,
  postDetailUrl,
} = usePostActions(postComputed)

const submitReply = function () {
  if (!replyContent.value.trim()) return

  handleReply(replyContent.value)
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
          :disabled="isReplyLoading"
          @submit="submitReply"
          @cancel="() => toggleReplyForm()"
      />
    </div>

    <div class="mt-3">
      <PostStats
          :likes-count="likesCount"
          :replies-count="repliesCount"
          :is-liked="liked"
          :is-like-loading="isLikeLoading"
          :is-reply-loading="isReplyLoading"
          @like.stop="handleLike"
          @reply.stop="toggleReplyForm"
      />
    </div>
  </article>
</template>
