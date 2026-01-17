<script setup lang="ts">
import type { Webmention } from '~~/shared/types/webmention'

const { webmention } = defineProps<{
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
  <article class="py-4 border-b border-gray-200 dark:border-gray-800 last:border-b-0">
    <div v-if="isLike" class="flex items-center gap-3">
      <div class="flex-shrink-0">
        <UAvatar
          v-if="webmention.author?.photo"
          :src="webmention.author.photo"
          :alt="webmention.author.name || 'Anonymous'"
          size="sm"
        />
        <div v-else class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <UIcon name="i-heroicons-user" class="w-4 h-4 text-gray-500" />
        </div>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm">
          <a
            v-if="webmention.author?.url"
            :href="webmention.author.url"
            target="_blank"
            rel="noopener noreferrer"
            class="font-medium text-gray-900 dark:text-gray-100 hover:underline"
          >
            {{ webmention.author?.name || 'Someone' }}
          </a>
          <span v-else class="font-medium text-gray-900 dark:text-gray-100">
            {{ webmention.author?.name || 'Someone' }}
          </span>
          <span class="text-gray-500 dark:text-gray-400"> liked this</span>
        </p>
        <a
          :href="webmention.source"
          target="_blank"
          rel="noopener noreferrer"
          class="text-xs text-gray-500 dark:text-gray-400 hover:underline"
        >
          {{ formattedDate }}
        </a>
      </div>
      <UIcon name="i-heroicons-heart-solid" class="w-5 h-5 text-red-500 flex-shrink-0" />
    </div>

    <div v-else-if="isComment" class="flex gap-3">
      <div class="flex-shrink-0">
        <UAvatar
          v-if="webmention.author?.photo"
          :src="webmention.author.photo"
          :alt="webmention.author.name || 'Anonymous'"
          size="sm"
        />
        <div v-else class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <UIcon name="i-heroicons-user" class="w-4 h-4 text-gray-500" />
        </div>
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-baseline gap-2 mb-1">
          <a
            v-if="webmention.author?.url"
            :href="webmention.author.url"
            target="_blank"
            rel="noopener noreferrer"
            class="font-medium text-sm text-gray-900 dark:text-gray-100 hover:underline"
          >
            {{ webmention.author?.name || 'Anonymous' }}
          </a>
          <span v-else class="font-medium text-sm text-gray-900 dark:text-gray-100">
            {{ webmention.author?.name || 'Anonymous' }}
          </span>
          <a
            :href="webmention.source"
            target="_blank"
            rel="noopener noreferrer"
            class="text-xs text-gray-500 dark:text-gray-400 hover:underline"
          >
            {{ formattedDate }}
          </a>
        </div>
        <div
          v-if="webmention.content?.text"
          class="text-sm text-gray-700 dark:text-gray-300 break-words"
        >
          {{ webmention.content.text }}
        </div>
      </div>
    </div>

    <div v-else class="flex items-center gap-3">
      <div class="flex-shrink-0">
        <UAvatar
          v-if="webmention.author?.photo"
          :src="webmention.author.photo"
          :alt="webmention.author.name || 'Anonymous'"
          size="sm"
        />
        <div v-else class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <UIcon name="i-heroicons-user" class="w-4 h-4 text-gray-500" />
        </div>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm">
          <a
            v-if="webmention.author?.url"
            :href="webmention.author.url"
            target="_blank"
            rel="noopener noreferrer"
            class="font-medium text-gray-900 dark:text-gray-100 hover:underline"
          >
            {{ webmention.author?.name || 'Someone' }}
          </a>
          <span v-else class="font-medium text-gray-900 dark:text-gray-100">
            {{ webmention.author?.name || 'Someone' }}
          </span>
          <span class="text-gray-500 dark:text-gray-400"> mentioned this</span>
        </p>
        <a
          :href="webmention.source"
          target="_blank"
          rel="noopener noreferrer"
          class="text-xs text-gray-500 dark:text-gray-400 hover:underline"
        >
          {{ formattedDate }}
        </a>
      </div>
    </div>
  </article>
</template>
