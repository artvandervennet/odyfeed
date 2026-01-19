<script setup lang="ts">
import {useRepliesQuery} from '~/queries/replies'
import {usePostWebmentionsQuery} from '~/queries/webmentions'
import type {EnrichedPost} from '~~/shared/types/activitypub'
import {useAuthStore} from '~/stores/authStore'
import {extractUsernameAndStatusIdFromPostUrl} from '~/utils/postHelpers'
import {usePostActions} from '~/composables/usePostActions'

const props = defineProps<{
  post: EnrichedPost
}>()
const {isLoggedIn} = useAuthStore()

const showReplyForm = ref(false)
const replyContent = ref('')

const postComputed = computed(() => props.post)
const {
  liked,
  likesCount,
  repliesCount,
  handleLike,
  handleReply,
} = usePostActions(postComputed)

const {data: replies, isLoading: repliesLoading} = useRepliesQuery()(props.post)

const {username, statusId} = extractUsernameAndStatusIdFromPostUrl(props.post.id)

const {data: webmentions, isLoading: webmentionsLoading} = usePostWebmentionsQuery()(
    username,
    statusId,
)

const postUrl = computed(() => props.post.id)

const submitReply = function () {
  if (!replyContent.value.trim()) return

  handleReply(replyContent.value)
  replyContent.value = ''
  showReplyForm.value = false
}

const toggleReplyForm = function () {
  showReplyForm.value = !showReplyForm.value
  if (!showReplyForm.value) {
    replyContent.value = ''
  }
}
</script>

<template>
  <div>
    <article class="h-entry p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div v-if="props.post.actor" class="p-author h-card">
        <ActorInfo
            :actor="props.post.actor"
            :show-tone="true"
            :clickable="true"
        />
      </div>

      <div class="mt-5">
        <PostContent
            :content="props.post.content"
            :published="props.post.published!"
        />
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
            @click.stop="handleLike"
            class="flex-1"
            :disabled="!isLoggedIn"
        >
          {{ liked ? 'Unlike' : 'Like' }}
        </UButton>
        <UButton
            icon="i-heroicons-chat-bubble-left"
            size="md"
            color="neutral"
            variant="ghost"
            @click.stop="toggleReplyForm"
            class="flex-1"
            :disabled="!isLoggedIn"
        >
          Reply
        </UButton>
      </div>
    </article>

    <div v-if="showReplyForm" class="p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
      <PostForm
          v-model="replyContent"
          @submit="submitReply"
          @cancel="toggleReplyForm"
          :disabled="!isLoggedIn"
      />
    </div>

    <div v-if="!showReplyForm && (replies && replies.length > 0)"
         class="px-4 py-3 bg-gray-50 dark:bg-gray-900/20 border-b border-gray-200 dark:border-gray-800">
      <h2 class="text-base font-bold text-gray-900 dark:text-gray-100">Replies</h2>
    </div>

    <PostList :posts="replies || []" :is-loading="repliesLoading" empty="No replies yet. Be the first to reply!"/>

    <WebmentionList
        :webmentions="webmentions?.items || []"
        :is-loading="webmentionsLoading"
    />

    <div class="border-t border-gray-200 dark:border-gray-800 p-4">
      <WebmentionForm :target-url="postUrl"/>
    </div>
  </div>
</template>
