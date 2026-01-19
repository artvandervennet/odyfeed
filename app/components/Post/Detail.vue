<script setup lang="ts">
import { useRepliesQuery } from '~/queries/replies'
import { usePostWebmentionsQuery } from '~/queries/webmentions'
import type { EnrichedPost } from '~~/shared/types/activitypub'
import { useAuthStore } from '~/stores/authStore'
import { extractStatusIdFromPostUrl } from '~/utils/postHelpers'
import { usePostActions } from '~/composables/usePostActions'

const props = defineProps<{
  post: EnrichedPost
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
} = usePostActions(postComputed)

const { data: replies, isLoading: repliesLoading } = useRepliesQuery()(props.post)

const username = computed(() => props.post.actor?.preferredUsername || '')
const statusId = computed(() => extractStatusIdFromPostUrl(props.post.id))

const { data: webmentions, isLoading: webmentionsLoading } = usePostWebmentionsQuery()(
  username.value,
  statusId.value
)

const postUrl = computed(() => props.post.id)

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
  <div>
    <article class="h-entry p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div v-if="props.post.actor" class="p-author h-card">
        <ActorInfo
            :actor="props.post.actor"
            :show-tone="true"
            :clickable="true"
        />
      </div>

      <div class="mt-4">
        <div
            class="e-content prose prose-base max-w-none dark:prose-invert text-base leading-relaxed mb-4 whitespace-pre-wrap wrap-break-word">
          {{ props.post.content }}
        </div>
        <a :href="postUrl" class="u-url">
          <time :datetime="props.post.published" class="dt-published text-sm text-gray-500 dark:text-gray-400">
            {{
              new Date(props.post.published!).toLocaleString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            }}
          </time>
        </a>
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
            :loading="isLikeLoading"
            :disabled="isLikeLoading"
            @click.stop="handleLike"
            class="flex-1"
        >
          {{ liked ? 'Unlike' : 'Like' }}
        </UButton>
        <UButton
            icon="i-heroicons-chat-bubble-left"
            size="md"
            color="neutral"
            variant="ghost"
            :disabled="isReplyLoading"
            @click.stop="toggleReplyForm"
            class="flex-1"
        >
          Reply
        </UButton>
      </div>
    </article>

    <div v-if="showReplyForm" class="p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
      <ReplyForm
          v-model="replyContent"
          placeholder="Post your reply..."
          :disabled="isReplyLoading"
          @submit="submitReply"
          @cancel="toggleReplyForm"
      />
    </div>

    <div v-if="!showReplyForm && (replies && replies.length > 0)"
         class="px-4 py-3 bg-gray-50 dark:bg-gray-900/20 border-b border-gray-200 dark:border-gray-800">
      <h2 class="text-base font-bold text-gray-900 dark:text-gray-100">Replies</h2>
    </div>

    <ReplyList :replies="replies || []" :is-loading="repliesLoading"/>

    <WebmentionList
      :webmentions="webmentions?.items || []"
      :is-loading="webmentionsLoading"
    />

    <div class="border-t border-gray-200 dark:border-gray-800 p-4">
      <WebmentionForm :target-url="postUrl" />
    </div>
  </div>
</template>
