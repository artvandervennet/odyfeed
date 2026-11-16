<script setup lang="ts">
import type { Webmention } from '~~/shared/types/webmention'

const { webmentions, isLoading } = defineProps<{
  webmentions: Webmention[]
  isLoading?: boolean
}>()

const comments = computed(() =>
  webmentions.filter((wm) => wm.type === 'comment')
)

const likes = computed(() =>
  webmentions.filter((wm) => wm.type === 'like')
)

const others = computed(() =>
  webmentions.filter((wm) => wm.type !== 'comment' && wm.type !== 'like')
)

const hasWebmentions = computed(() => webmentions.length > 0)
</script>

<template>
  <section class="webmentions" aria-labelledby="webmentions-h">
    <h2 id="webmentions-h">Webmentions</h2>

    <div v-if="isLoading" class="stack" aria-busy="true">
      <span class="visually-hidden" role="status">Loading webmentions…</span>
      <span v-for="i in 2" :key="i" class="skeleton skeleton-row"/>
    </div>

    <template v-else-if="hasWebmentions">
      <template v-if="comments.length > 0">
        <h3>Comments ({{ comments.length }})</h3>
        <ul class="stack">
          <li v-for="webmention in comments" :key="webmention.id">
            <WebmentionCard :webmention="webmention"/>
          </li>
        </ul>
      </template>

      <template v-if="likes.length > 0">
        <h3>Likes ({{ likes.length }})</h3>
        <ul class="stack">
          <li v-for="webmention in likes" :key="webmention.id">
            <WebmentionCard :webmention="webmention"/>
          </li>
        </ul>
      </template>

      <template v-if="others.length > 0">
        <h3>Mentions ({{ others.length }})</h3>
        <ul class="stack">
          <li v-for="webmention in others" :key="webmention.id">
            <WebmentionCard :webmention="webmention"/>
          </li>
        </ul>
      </template>
    </template>

    <p v-else class="empty">No webmentions yet</p>
  </section>
</template>
