<script setup>
import { onMounted, computed } from "vue";
import { useAuthStore } from "~/stores/authStore.ts";
import { useTimelineStore } from "~/stores/timeline";

const auth = useAuthStore();
const timelineStore = useTimelineStore();

const timeline = computed(() => timelineStore.timeline);
const isLoading = computed(() => timelineStore.isLoading);


</script>

<template>
  <UContainer>
    <div class="max-w-2xl mx-auto">
      <div class="mb-8 h-card">
        <h1 class="p-name text-3xl font-bold mb-2">Timeline</h1>
        <p class="p-note text-gray-500 dark:text-gray-400">The story of the Odysee, told through the eyes of its actors.</p>
        <a :href="useRuntimeConfig().public.baseUrl" class="u-url hidden" rel="me">OdyFeed</a>
      </div>

      <div v-if="isLoading && !timeline" class="space-y-4">
        <USkeleton v-for="i in 3" :key="i" class="h-40 w-full" />
      </div>

      <div v-else-if="timeline?.orderedItems" class="space-y-4">
        <PostCard
            v-for="post in timeline.orderedItems"
            :key="post.id"
            :post="post"
        />
      </div>

      <UCard v-else-if="timeline" class="text-center py-10">
        <UIcon name="i-heroicons-information-circle" class="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p class="text-gray-500">The timeline is empty. Check back later!</p>
        <UButton color="gray" variant="link" class="mt-2" @click="timelineStore.refresh()">Refresh</UButton>
      </UCard>
    </div>
  </UContainer>
</template>