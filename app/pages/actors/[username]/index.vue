<script setup lang="ts">
import type { ASActor, ASNote, EnrichedPost } from '~~/shared/types/activitypub'
import { useAuthStore } from '~/stores/authStore'
import {fetchActor} from "~/api/actors";
import LoadingCard from '~/components/atoms/LoadingCard.vue'

const route = useRoute()
const username = route.params.username as string
const auth = useAuthStore()

const isOwnProfile = computed(() => auth.username === username)

const { data: actor, isLoading: actorLoading, error: actorError } = useQuery({
  key: queryKeys.actors.byUsername(username),
  query: () => fetchActor(username),
  staleTime: 1000 * 60 * 5,
})


const { data: actorPosts, isLoading: postsLoading } = useQuery({
  key: queryKeys.actors.posts(username),
  query: async () => {
    return await $fetch(`/api/actors/${username}/posts`, {
      headers: {
        'Accept': 'application/json',
      }
    })
  },
  staleTime: 1000 * 60 * 5,
  enabled: () => !!actor.value,
})


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
  <div>
    <template v-if="actorError || actor === null">
      <div class="band page-head" data-paint="deep">
        <div class="inner">
          <h1>Actor Not Found</h1>
        </div>
        <art-drip class="band-drip" pigment="--surface" seed="actor" count="9" stagger flush/>
      </div>
      <div class="band" data-paint="1">
        <div class="inner narrow">
          <div class="card empty">
            <art-splatter size="6rem" seed="actor"/>
            <p>The profile you're looking for doesn't exist or has been removed.</p>
            <art-button>
              <NuxtLink to="/">Back to Timeline</NuxtLink>
            </art-button>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="actorLoading">
      <div class="band page-head" data-paint="deep">
        <div class="inner" aria-busy="true">
          <span class="visually-hidden" role="status">Loading profile…</span>
          <span class="skeleton skeleton-title"/>
        </div>
      </div>
      <div class="band" data-paint="1">
        <div class="inner narrow">
          <LoadingCard/>
        </div>
      </div>
    </template>

    <template v-else-if="actor">
      <ActorProfileHeader :actor="actor" :is-own-profile="isOwnProfile">
        <template #stats>
          <ActorProfileStats :posts-count="postsCount" />
        </template>
      </ActorProfileHeader>

      <section class="band" data-paint="1" aria-labelledby="actor-posts-h">
        <div class="inner narrow">
          <h2 id="actor-posts-h" class="visually-hidden">Posts</h2>
          <PostList
            small
            :posts="enrichedPosts"
            :is-loading="postsLoading"
            :empty="isOwnProfile ? `You haven't posted anything yet.` : `${username} hasn't posted anything yet.`"
          />
        </div>
      </section>
    </template>
  </div>
</template>
