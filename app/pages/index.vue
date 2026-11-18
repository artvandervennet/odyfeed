<script setup>
import { useTimelineQuery } from "~/queries/timeline"
import LoadingCard from "~/components/atoms/LoadingCard.vue"
import EmptyState from "~/components/atoms/EmptyState.vue"
import ScrollProgressBar from "~/components/atoms/ScrollProgressBar.vue"
import { useEventProgress } from "~/composables/useEventProgress"
import { useWebmentions } from "~/composables/useWebmentions"

const { data: timeline, isLoading } = useTimelineQuery()



const { currentEventIndex, totalEvents, registerEventElement } = useEventProgress(timeline)

const { webmentionCount } = useWebmentions()


const baseUrl = computed(() => typeof window !== 'undefined' ? window.location.origin : '')



</script>

<template>
  <div>
    <ScrollProgressBar
      :total-events="totalEvents"
      :current-event-index="currentEventIndex"
      :webmention-count="webmentionCount"
    />

    <div id="top" class="band hero h-card" data-paint="deep">
      <div class="inner">
        <!-- The site's name, and the wordmark: <art-header> flies it up into its place as you scroll. -->
        <h1 class="p-name" data-wordmark>
          <art-stroke pigment="stroke" seed="odyssey" animate>OdyFeed</art-stroke>
        </h1>
        <p class="lead p-note">The story of the Odyssey, told through the eyes of its actors.</p>
        <a :href="baseUrl" class="u-url" rel="me" hidden>OdyFeed</a>
      </div>
      <art-drip class="band-drip" pigment="--surface" seed="odyssey" count="9" stagger flush/>
    </div>

    <div v-if="isLoading && !timeline" class="band" data-paint="1">
      <div class="inner">
        <LoadingCard />
      </div>
    </div>

    <template v-else-if="timeline?.groupedByEvent && timeline.groupedByEvent.length > 0">
      <!-- One painted band per event of the story, its title pinned beside its posts.
           The paints walk the colour wheel and start again after the eighth. -->
      <section
        v-for="(group, index) in timeline.groupedByEvent"
        :key="group.event.id"
        :ref="(el) => registerEventElement(group.event.id, el)"
        class="band section"
        :data-paint="(index % 8) + 1"
        :aria-labelledby="`event-${index}`"
      >
        <div class="inner">
          <div class="section-head">
            <h2 :id="`event-${index}`" class="section-title">{{ group.event.title }}</h2>
            <p class="intro">{{ group.event.description }}</p>
          </div>
          <div class="section-body">
            <PostList
              :posts="group.posts"
              :empty="'No posts yet.'"
            />
          </div>
        </div>
      </section>
    </template>

    <div v-else-if="timeline" class="band" data-paint="1">
      <div class="inner">
        <EmptyState
          title="No posts yet"
          description="The timeline is empty. Check back later!"
        />
      </div>
    </div>
  </div>
</template>
