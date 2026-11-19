<script setup lang="ts">
import {useWebmentions} from '~/composables/useWebmentions'

const {webmentionCount, hasWebmentions, recentWebmentions, isLoading} = useWebmentions()
const year = new Date().getFullYear()
</script>

<template>
  <div class="inner">
    <div class="footer-about">
      <h2>OdyFeed</h2>
      <p>The Odyssey, told through ActivityPub</p>
    </div>

    <section class="footer-mentions" aria-labelledby="footer-mentions-h">
      <h2 id="footer-mentions-h">
        <template v-if="hasWebmentions">
          {{ webmentionCount }} Webmention{{ webmentionCount !== 1 ? 's' : '' }}
        </template>
        <template v-else>Webmentions</template>
      </h2>
      <p v-if="hasWebmentions && recentWebmentions.length > 0">Recent mentions from external sites</p>
      <p v-else-if="!isLoading && !hasWebmentions">No webmentions yet</p>

      <ul v-if="hasWebmentions && recentWebmentions.length > 0" class="stack">
        <li v-for="webmention in recentWebmentions" :key="webmention.id">
          <WebmentionCard :webmention="webmention"/>
        </li>
      </ul>

      <WebmentionForm :target-url="useRoute().fullPath"/>
    </section>

    <div class="footer-legal">
      <!-- Gesso's footer note: the same words on every site, with this site's repo. -->
      <p class="footer-note">
        Something not quite right, or something missing?
        <a href="https://github.com/artvandervennet/odyfeed/issues/new/choose">Open an issue on GitHub</a>.
      </p>
      <p>© {{ year }} OdyFeed. All rights reserved.</p>
    </div>
    <art-signature :year="year">Art Van der Vennet</art-signature>
  </div>
</template>
