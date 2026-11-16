<script setup lang="ts">
import type {Webmention} from '~~/shared/types/webmention'

const {webmention} = defineProps<{
  webmention: Webmention
}>()

const formattedDate = computed(() => {
  const date = webmention.published || webmention.received
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
})

const isComment = computed(() => webmention.type === 'comment')
const isLike = computed(() => webmention.type === 'like')
</script>

<template>
  <article class="card mention">
    <ActorAvatar
        :avatar-url="webmention.author?.photo"
        :username="webmention.author?.name || 'Anonymous'"
        size="sm"
    />

    <div class="mention-text">
      <p>
        <a
            :href="isLike || isComment ? (webmention.author?.url || webmention.source) : webmention.source"
            target="_blank"
            rel="noopener noreferrer"
        >{{ webmention.author?.name || (isComment ? 'Anonymous' : 'Someone') }}</a>
        <template v-if="isLike"> liked this</template>
        <template v-else-if="!isComment"> mentioned this</template>
        <span class="mention-date">{{ formattedDate }}</span>
      </p>
      <p v-if="isComment && webmention.content?.text" class="mention-comment">
        {{ webmention.content.text }}
      </p>
    </div>
  </article>
</template>
