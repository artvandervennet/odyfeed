<script setup lang="ts">
import type {EnrichedPost} from '~~/shared/types/activitypub'
import {useAuthStore} from '~/stores/authStore'
import {usePostActions} from '~/composables/usePostActions'

const props = defineProps<{
  post?: EnrichedPost
  reply?: EnrichedPost
  level?: number
}>()

const auth = useAuthStore()

const showReplyForm = ref(false)
const replyContent = ref('')

const currentPost = computed(() => props.post || props.reply!)
const postComputed = computed(() => currentPost.value)
const {
  liked,
  likesCount,
  repliesCount,
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
  <article
      class="relative border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors cursor-pointer p-4"
      :class="{ 'pl-12 ml-4 border-l-2 border-gray-200 dark:border-gray-700': props.level && props.level > 0 }">
    <NuxtLink
        :to="postDetailUrl"
        class="absolute inset-0 z-0"
        aria-label="View post details"
    />

    <div class="relative z-10">
      <ActorInfo
          v-if="currentPost.actor"
          :actor="currentPost.actor"
          :show-tone="true"
          :clickable="true"
      />
    </div>

    <div class="mt-3">
      <PostContent
          :content="currentPost.content"
          :published="currentPost.published!"
      />
    </div>

    <div v-if="showReplyForm" class="relative z-10 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <PostForm
          v-model="replyContent"
          @submit.stop="submitReply"
          @cancel.stop="() => toggleReplyForm()"
      />
    </div>

    <div class="relative z-10 mt-3">
      <PostStats
          :likes-count="likesCount"
          :replies-count="repliesCount"
          :is-liked="liked"
          @like.stop="handleLike"
          @reply.stop="toggleReplyForm"
          :disabled="!auth.isLoggedIn"
      />
    </div>
  </article>
</template>
