<script setup lang="ts">
import type { EnrichedPost } from '~~/shared/types/activitypub'

const {post, showReplies, isDetailView} = defineProps<{
  post: EnrichedPost
  showReplies?: boolean
  isDetailView?: boolean
}>()

// const { likePost, undoLikePost, replyToPost } = useActivityPub()
// const { isLiked, getLikesCount, getRepliesCount, getActorUsername, getPostId } = useInteractions()

const showReplyForm = ref(false)
const replyContent = ref('')

const liked = computed(() => false)
const likesCount = computed(() => post.likes?.totalItems || 0)
const repliesCount = computed(() => post.replies?.totalItems || 0)

const postDetailUrl = computed(() => {
  const username = post.actor?.preferredUsername
  const statusId = post.id.split('/').pop()
  console.log("username:", username, " statusId: ", statusId)
  return `/actors/${username}/status/${statusId}`
})

const handleLike = async function () {

}

const handleReply = async function () {
  if (!replyContent.value.trim()) return


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
        @cancel="toggleReplyForm"
      />
    </div>

    <div class="mt-3">
      <PostStats
        :likes-count="likesCount"
        :replies-count="repliesCount"
        :is-liked="liked"
        @like="handleLike"
        @reply="toggleReplyForm"
      />
    </div>
  </article>
</template>
