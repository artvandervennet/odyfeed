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

const authorName = computed(() => currentPost.value.actor?.name || 'someone')

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
  <!-- The whole card opens the post: one link stretched over it. The author, the buttons and
       the reply form sit above that link. -->
  <article class="card post" :class="{ nested: props.level && props.level > 0 }">
    <NuxtLink :to="postDetailUrl" class="post-link" :aria-label="`View post by ${authorName}`"/>

    <ActorInfo
        v-if="currentPost.actor"
        :actor="currentPost.actor"
        :show-tone="true"
    />

    <PostContent
        :content="currentPost.content"
        :published="currentPost.published!"
    />

    <PostForm
        v-if="showReplyForm"
        v-model="replyContent"
        @submit="submitReply"
        @cancel="() => toggleReplyForm()"
    />

    <PostStats
        :likes-count="likesCount"
        :replies-count="repliesCount"
        :is-liked="liked"
        :disabled="!auth.isLoggedIn"
        @like="handleLike"
        @reply="toggleReplyForm"
    />
  </article>
</template>
