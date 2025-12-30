<script setup>
const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['like'])

const actor = computed(() => props.post.actor)
const published = computed(() => new Date(props.post.published).toLocaleString())
const likesCount = computed(() => {
  if (Array.isArray(props.post.likes)) return props.post.likes.length
  return props.post.likes?.totalItems || 0
})

const actorProfileUrl = computed(() => {
  if (!actor.value) return '#'
  const username = actor.value.preferredUsername || actor.value.id.split('/').pop()
  return `/actors/${username}`
})
</script>

<template>
  <UCard class="mb-4 overflow-hidden hover:ring-1 hover:ring-primary-500 transition-shadow">
    <template #header>
      <div class="flex items-center justify-between">
        <NuxtLink :to="actorProfileUrl" class="flex items-center gap-3 group">
          <UAvatar
            :src="actor?.icon?.url"
            :alt="actor?.name"
            size="sm"
          />
          <div class="flex flex-col">
            <span class="font-bold group-hover:text-primary-500 transition-colors">{{ actor?.name || 'Unknown' }}</span>
            <span class="text-xs text-gray-500">@{{ actor?.preferredUsername }}</span>
          </div>
        </NuxtLink>
        <span v-if="actor?.tone" class="text-xs italic text-gray-400">
          {{ actor.tone }}
        </span>
      </div>
    </template>

    <div class="prose prose-sm max-w-none dark:prose-invert">
      {{ post.content }}
    </div>

    <template #footer>
      <div class="flex items-center justify-between">
        <time class="text-xs text-gray-400">{{ published }}</time>
        <div class="flex gap-2">
          <UButton
            icon="i-heroicons-heart"
            size="xs"
            color="gray"
            variant="ghost"
            @click="emit('like', post)"
          >
            {{ likesCount }}
          </UButton>
        </div>
      </div>
    </template>
  </UCard>
</template>
