<script setup lang="ts">
import {useRepliesQuery} from '~/queries/replies'
import {usePostWebmentionsQuery} from '~/queries/webmentions'
import type {EnrichedPost} from '~~/shared/types/activitypub'
import {useAuthStore} from '~/stores/authStore'
import {extractUsernameAndStatusIdFromPostUrl} from '~/utils/postHelpers'
import {usePostActions} from '~/composables/usePostActions'
import ActionButton from '~/components/atoms/ActionButton.vue'

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
  <div class="stack post-detail">
    <article class="h-entry card post">
      <div v-if="props.post.actor" class="p-author h-card">
        <ActorInfo
            :actor="props.post.actor"
            :show-tone="true"
        />
      </div>

      <PostContent
          :content="props.post.content"
          :published="props.post.published!"
      />

      <p class="counts">
        <span><strong>{{ likesCount }}</strong> {{ likesCount === 1 ? 'Like' : 'Likes' }}</span>
        <span><strong>{{ repliesCount }}</strong> {{ repliesCount === 1 ? 'Reply' : 'Replies' }}</span>
      </p>

      <div class="post-actions">
        <ActionButton
            :icon="liked ? 'i-heroicons-heart-20-solid' : 'i-heroicons-heart'"
            :label="liked ? 'Unlike' : 'Like'"
            label-visible
            :pressed="liked"
            :disabled="!isLoggedIn"
            @click="handleLike"
        />
        <ActionButton
            icon="i-heroicons-chat-bubble-left"
            label="Reply"
            label-visible
            :disabled="!isLoggedIn"
            @click="toggleReplyForm"
        />
      </div>

      <PostForm
          v-if="showReplyForm"
          v-model="replyContent"
          :disabled="!isLoggedIn"
          @submit="submitReply"
          @cancel="toggleReplyForm"
      />
    </article>

    <section aria-labelledby="replies-h">
      <h2 id="replies-h">Replies</h2>
      <PostList :posts="replies || []" :is-loading="repliesLoading" empty="No replies yet. Be the first to reply!"/>
    </section>

    <WebmentionList
        :webmentions="webmentions?.items || []"
        :is-loading="webmentionsLoading"
    />
  </div>
</template>
