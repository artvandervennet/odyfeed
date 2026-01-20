<script setup lang="ts">
import {useWebmentions} from '~/composables/useWebmentions'

const {webmentionCount, hasWebmentions, recentWebmentions, isLoading} = useWebmentions()
</script>

<template>

  <UContainer class="pb-15">
    <div class="max-w-2xl mx-auto flex flex-col gap-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 class="text-lg font-semibold mb-2">OdyFeed</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            The Odyssey, told through ActivityPub
          </p>
        </div>

        <div v-if="hasWebmentions" class="w-full md:w-auto">
          <div class="flex items-center gap-2 mb-2">
            <UIcon name="i-heroicons-chat-bubble-left-right" class="w-4 h-4 text-gray-500"/>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ webmentionCount }} Webmention{{ webmentionCount !== 1 ? 's' : '' }}
              </span>
          </div>
          <div v-if="recentWebmentions.length > 0" class="text-xs text-gray-500 dark:text-gray-400">
            Recent mentions from external sites
          </div>
        </div>

        <div v-else-if="!isLoading" class="text-sm text-gray-500 dark:text-gray-400">
          <UIcon name="i-heroicons-chat-bubble-left-right" class="w-4 h-4 inline mr-1"/>
          No webmentions yet
        </div>
      </div>

      <div
          v-if="hasWebmentions && recentWebmentions.length > 0"
          class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800"
      >
        <div class="space-y-3">
          <WebmentionCard
              v-for="webmention in recentWebmentions"
              :key="webmention.id"
              :webmention="webmention"
          />
        </div>
      </div>
      <WebmentionForm :target-url="useRoute().fullPath"/>
    </div>
  </UContainer>
</template>
