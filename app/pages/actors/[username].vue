<script setup>
import { useQuery } from '@pinia/colada';
import { computed } from 'vue';
import { useRoute } from '#app';

const route = useRoute();
const username = route.params.username;
console.log('username', username)

const { data: actor } = useQuery({
  key: ['actors', username],
  query: () => $fetch(`/api/actors/${username}`)
});

const { data: timeline } = useQuery({
  key: ['timeline', username],
  query: () => $fetch('/api/timeline')
});

const actorPosts = computed(() => {
  if (!timeline.value?.orderedItems || !actor.value) return [];
  return timeline.value.orderedItems.filter((post) => 
    post.actor?.id === actor.value.id || post.attributedTo === actor.value.id
  );
});
</script>

<template>
  <UContainer>
    <div v-if="actor" class="max-w-2xl mx-auto">
      <UCard class="mb-8">
        <div class="flex items-start gap-6">
          <UAvatar
            :src="actor.icon?.url"
            :alt="actor.name"
            size="xl"
            class="ring-4 ring-primary-500/20"
          />
          <div class="flex-1">
            <div class="flex items-center justify-between mb-2">
              <h1 class="text-2xl font-bold">{{ actor.name }}</h1>
              <UBadge v-if="actor.tone" color="primary" variant="subtle">
                {{ actor.tone }}
              </UBadge>
            </div>
            <p class="text-gray-500 mb-4">@{{ actor.preferredUsername }}</p>
            <p v-if="actor.summary" class="text-sm dark:text-gray-300">
              {{ actor.summary }}
            </p>
            
            <div class="flex gap-4 mt-6 text-sm">
              <div>
                <span class="font-bold">{{ actorPosts.length }}</span>
                <span class="text-gray-500 ml-1">Posts</span>
              </div>
            </div>
          </div>
        </div>
      </UCard>

      <div class="space-y-4">
        <h2 class="text-xl font-bold mb-4 px-1">Posts</h2>
        <PostCard 
          v-for="post in actorPosts" 
          :key="post.id" 
          :post="post"
        />
        <UCard v-if="actorPosts.length === 0" class="text-center py-10 italic text-gray-500">
          No posts from this actor yet.
        </UCard>
      </div>
    </div>
    <div v-else-if="actor === null" class="text-center py-20">
      <UIcon name="i-heroicons-face-frown" class="w-16 h-16 mx-auto text-gray-400 mb-4" />
      <h2 class="text-2xl font-bold">Actor not found</h2>
      <UButton to="/" class="mt-4" color="gray">Back to Timeline</UButton>
    </div>
    <div v-else class="max-w-2xl mx-auto space-y-4">
      <USkeleton class="h-40 w-full" />
      <USkeleton v-for="i in 3" :key="i" class="h-32 w-full" />
    </div>
  </UContainer>
</template>
