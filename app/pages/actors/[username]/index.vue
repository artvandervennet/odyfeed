<script setup lang="ts">
import type { ASActor, ASNote, EnrichedPost } from '~~/shared/types/activitypub'
import { useAuthStore } from '~/stores/authStore'

const route = useRoute()
const username = route.params.username as string
const auth = useAuthStore()

const isOwnProfile = computed(() => auth.username === username)

// const { data: actor, isLoading: actorLoading, error: actorError } = useQuery({
//   key: queryKeys.actors.byUsername(username),
//   query: () => fetchActor(username),
//   staleTime: 1000 * 60 * 5,
// })

const actor = ref<ASActor>({
  "@context": [
    "https://www.w3.org/ns/activitystreams",
    "https://w3id.org/security/v1"
  ],
  "id": "https://odyfeed.example.com/actors/johndoe",
  "type": "Person",
  "name": "John Doe",
  "preferredUsername": "johndoe",
  "summary": "Software developer passionate about decentralized web technologies and open-source projects. Love hiking and photography in my spare time.",
  "url": "https://odyfeed.example.com/@johndoe",
  "inbox": "https://odyfeed.example.com/actors/johndoe/inbox",
  "outbox": "https://odyfeed.example.com/actors/johndoe/outbox",
  "following": "https://odyfeed.example.com/actors/johndoe/following",
  "followers": "https://odyfeed.example.com/actors/johndoe/followers",
  "icon": {
    "type": "Image",
    "url": "https://odyfeed.example.com/avatars/johndoe.jpg",
    "mediaType": "image/jpeg"
  },
  "image": {
    "type": "Image",
    "url": "https://odyfeed.example.com/banners/johndoe-banner.jpg",
    "mediaType": "image/jpeg"
  },
  "publicKey": {
    "id": "https://odyfeed.example.com/actors/johndoe#main-key",
    "owner": "https://odyfeed.example.com/actors/johndoe",
    "publicKeyPem": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END PUBLIC KEY-----"
  },
  "manuallyApprovesFollowers": false,
  "discoverable": true,
  "indexable": true,
  "memorial": false,
  "suspended": false,
  "featured": "https://odyfeed.example.com/actors/johndoe/collections/featured",
  "featuredTags": "https://odyfeed.example.com/actors/johndoe/collections/tags",
  "endpoints": {
    "sharedInbox": "https://odyfeed.example.com/inbox"
  },
  "tone": "friendly"
})

const actorLoading = ref(false)
const actorError = false

// const { data: actorPosts, isLoading: postsLoading } = useQuery({
//   key: queryKeys.actors.posts(username),
//   query: async () => {
//     return await $fetch(`/api/actors/${username}/posts`, {
//       headers: {
//         'Accept': 'application/json',
//       }
//     })
//   },
//   staleTime: 1000 * 60 * 5,
//   enabled: () => !!actor.value,
// })

const actorPosts = ref<ASNote[]>([
  {
    "@context": "https://www.w3.org/ns/activitystreams",
    id: "https://odyfeed.example.com/actors/johndoe/posts/1",
    type: "Note",
    attributedTo: "https://odyfeed.example.com/actors/johndoe",
    content: "Just finished setting up my decentralized profile! Excited to be part of the open web movement. 🌐",
    published: "2026-01-18T14:30:00Z",
    to: ["https://www.w3.org/ns/activitystreams#Public"],
    cc: ["https://odyfeed.example.com/actors/johndoe/followers"],
    url: "https://odyfeed.example.com/@johndoe/posts/1",
    likes: {
      "@context": "https://www.w3.org/ns/activitystreams",
      id: "https://odyfeed.example.com/actors/johndoe/posts/1/likes",
      type: "Collection",
      totalItems: 12
    }
  },
  {
    "@context": "https://www.w3.org/ns/activitystreams",
    id: "https://odyfeed.example.com/actors/johndoe/posts/2",
    type: "Note",
    attributedTo: "https://odyfeed.example.com/actors/johndoe",
    content: "Beautiful sunset hike today at Mount Rainier. The colors were absolutely stunning! Nature never ceases to amaze me. 🏔️📸",
    published: "2026-01-17T20:15:00Z",
    to: ["https://www.w3.org/ns/activitystreams#Public"],
    cc: ["https://odyfeed.example.com/actors/johndoe/followers"],
    url: "https://odyfeed.example.com/@johndoe/posts/2",
    likes: {
      "@context": "https://www.w3.org/ns/activitystreams",
      id: "https://odyfeed.example.com/actors/johndoe/posts/2/likes",
      type: "Collection",
      totalItems: 24
    }
  },
  {
    "@context": "https://www.w3.org/ns/activitystreams",
    id: "https://odyfeed.example.com/actors/johndoe/posts/3",
    type: "Note",
    attributedTo: "https://odyfeed.example.com/actors/johndoe",
    content: "Working on a new open-source project for ActivityPub integration. Stay tuned for updates! If anyone wants to contribute, let me know.",
    published: "2026-01-16T10:45:00Z",
    to: ["https://www.w3.org/ns/activitystreams#Public"],
    cc: ["https://odyfeed.example.com/actors/johndoe/followers"],
    url: "https://odyfeed.example.com/@johndoe/posts/3",
    likes: {
      "@context": "https://www.w3.org/ns/activitystreams",
      id: "https://odyfeed.example.com/actors/johndoe/posts/3/likes",
      type: "Collection",
      totalItems: 8
    },
    replies: {
      "@context": "https://www.w3.org/ns/activitystreams",
      id: "https://odyfeed.example.com/actors/johndoe/posts/3/replies",
      type: "Collection",
      totalItems: 3
    }
  },
  {
    "@context": "https://www.w3.org/ns/activitystreams",
    id: "https://odyfeed.example.com/actors/johndoe/posts/4",
    type: "Note",
    attributedTo: "https://odyfeed.example.com/actors/johndoe",
    content: "Coffee and code on this rainy Sunday morning. Sometimes the best productivity comes from the simplest moments. ☕💻",
    published: "2026-01-15T08:20:00Z",
    to: ["https://www.w3.org/ns/activitystreams#Public"],
    cc: ["https://odyfeed.example.com/actors/johndoe/followers"],
    url: "https://odyfeed.example.com/@johndoe/posts/4",
    likes: {
      "@context": "https://www.w3.org/ns/activitystreams",
      id: "https://odyfeed.example.com/actors/johndoe/posts/4/likes",
      type: "Collection",
      totalItems: 15
    }
  },
  {
    "@context": "https://www.w3.org/ns/activitystreams",
    id: "https://odyfeed.example.com/actors/johndoe/posts/5",
    type: "Note",
    attributedTo: "https://odyfeed.example.com/actors/johndoe",
    content: "Interesting discussion about data ownership and privacy in the digital age. We need more decentralized solutions that put users first.",
    published: "2026-01-14T16:00:00Z",
    to: ["https://www.w3.org/ns/activitystreams#Public"],
    cc: ["https://odyfeed.example.com/actors/johndoe/followers"],
    url: "https://odyfeed.example.com/@johndoe/posts/5",
    likes: {
      "@context": "https://www.w3.org/ns/activitystreams",
      id: "https://odyfeed.example.com/actors/johndoe/posts/5/likes",
      type: "Collection",
      totalItems: 19
    },
    replies: {
      "@context": "https://www.w3.org/ns/activitystreams",
      id: "https://odyfeed.example.com/actors/johndoe/posts/5/replies",
      type: "Collection",
      totalItems: 7
    }
  }
])

const postsLoading = ref(false)

const enrichedPosts = computed(() => {
  if (!actorPosts.value || !actor.value) return []
  return actorPosts.value.map(post => ({
    ...post,
    actor: actor.value
  })) as EnrichedPost[]
})

const postsCount = computed(() => enrichedPosts.value?.length || 0)

useHead(() => ({
  title: actor.value ? `${actor.value.name} (@${actor.value.preferredUsername})` : 'Profile',
  meta: [
    {
      name: 'description',
      content: actor.value?.summary || `Profile of ${username}`
    }
  ]
}))
</script>

<template>
  <UContainer>
    <div class="max-w-4xl mx-auto">
      <template v-if="actorError || actor === null">
        <div class="text-center py-20">
          <UIcon name="i-heroicons-face-frown" class="w-20 h-20 mx-auto text-gray-400 mb-6" />
          <h2 class="text-3xl font-bold mb-4">Actor Not Found</h2>
          <p class="text-gray-500 dark:text-gray-400 mb-6">
            The profile you're looking for doesn't exist or has been removed.
          </p>
          <UButton to="/" color="primary" size="lg">
            <UIcon name="i-heroicons-arrow-left" class="mr-2" />
            Back to Timeline
          </UButton>
        </div>
      </template>

      <template v-else-if="actorLoading">
        <div class="space-y-6">
          <USkeleton class="h-48 w-full rounded-xl" />
          <div class="max-w-2xl mx-auto space-y-4">
            <USkeleton v-for="i in 3" :key="i" class="h-40 w-full rounded-lg" />
          </div>
        </div>
      </template>

      <template v-else-if="actor">
        <UCard class="mb-8 overflow-hidden">
          <ActorProfileHeader :actor="actor" :is-own-profile="isOwnProfile">
            <template #stats>
              <ActorProfileStats :posts-count="postsCount" />
            </template>
          </ActorProfileHeader>
        </UCard>

        <PostList
            small
          :posts="enrichedPosts"
          :is-loading="postsLoading"
          :empty="isOwnProfile ? `You haven't posted anything yet.` : `${username} hasn't posted anything yet.`"
        />
      </template>
    </div>
  </UContainer>
</template>

