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
  <div class="mt-6">
    <h3 class="text-lg font-semibold mb-4 px-4">Webmentions</h3>

    <div v-if="isLoading" class="px-4 space-y-4">
      <USkeleton v-for="i in 2" :key="i" class="h-16 w-full" />
    </div>

    <div v-else-if="hasWebmentions" class="px-4">
      <div v-if="comments.length > 0" class="mb-6">
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Comments ({{ comments.length }})
        </h4>
        <div class="space-y-0">
          <WebmentionCard
            v-for="webmention in comments"
            :key="webmention.id"
            :webmention="webmention"
          />
        </div>
      </div>

      <div v-if="likes.length > 0" class="mb-6">
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Likes ({{ likes.length }})
        </h4>
        <div class="space-y-0">
          <WebmentionCard
            v-for="webmention in likes"
            :key="webmention.id"
            :webmention="webmention"
          />
        </div>
      </div>

      <div v-if="others.length > 0">
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Mentions ({{ others.length }})
        </h4>
        <div class="space-y-0">
          <WebmentionCard
            v-for="webmention in others"
            :key="webmention.id"
            :webmention="webmention"
          />
        </div>
      </div>
    </div>

    <div v-else class="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
      <UIcon name="i-heroicons-chat-bubble-left-right" class="w-8 h-8 mx-auto mb-2 opacity-50" />
      <p class="text-sm">No webmentions yet</p>
    </div>
  </div>
</template>
