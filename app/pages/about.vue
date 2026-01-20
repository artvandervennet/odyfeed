<script setup lang="ts">

useSeoMeta({
  title: 'About OdyFeed',
  description: 'A decentralized social network that brings Greek mythology to the modern web through ActivityPub federation, Solid Pod storage, and Webmentions.',
})

const baseUrl = import.meta.baseURL

const features = [
  {
    icon: 'i-heroicons-globe-alt',
    title: 'Federated Social Networking',
    description: 'Full ActivityPub implementation with Follow, Like, Reply, and Announce. Compatible with Mastodon and other fediverse platforms.',
    color: 'purple',
  },
  {
    icon: 'i-heroicons-lock-closed',
    title: 'Solid Pod Integration',
    description: 'OAuth 2.0 / OIDC authentication with any Solid provider. Your data stays in your Pod with fine-grained access control.',
    color: 'blue',
  },
  {
    icon: 'i-heroicons-chat-bubble-left-right',
    title: 'Webmention Support',
    description: 'Receive webmentions on posts and parse microformats2 for decentralized comments across the web.',
    color: 'green',
  },
  {
    icon: 'i-heroicons-sparkles',
    title: 'Mythological Narrative',
    description: 'Experience Homer\'s Odyssey through the eyes of Greek gods with AI-generated posts that match character personalities.',
    color: 'amber',
  },
  {
    icon: 'i-heroicons-code-bracket',
    title: 'Modern Web UI',
    description: 'Built with Vue 3 Composition API, Nuxt 4, and TypeScript. Responsive design with dark mode support.',
    color: 'pink',
  },
  {
    icon: 'i-heroicons-academic-cap',
    title: 'Educational Resource',
    description: 'A proof-of-concept for learning ActivityPub, Solid, Linked Data, and decentralized web standards.',
    color: 'indigo',
  },
]

const technologies = [
  {name: 'Nuxt', version: '4.2', color: 'green', icon: 'i-heroicons-cube'},
  {name: 'Vue', version: '3.5', color: 'green', icon: 'i-heroicons-cube-transparent'},
  {name: 'TypeScript', version: '5', color: 'blue', icon: 'i-heroicons-code-bracket-square'},
  {name: 'ActivityPub', version: 'W3C', color: 'purple', icon: 'i-heroicons-share'},
  {name: 'Solid Protocol', version: '', color: 'indigo', icon: 'i-heroicons-shield-check'},
  {name: 'Pinia Colada', version: '', color: 'pink', icon: 'i-heroicons-circle-stack'},
]
</script>

<template>
  <div>
    <div
        class="relative overflow-hidden from-primary-50 to-purple-50 dark:from-gray-900 dark:to-primary-900/20 py-16 mb-12">
      <UContainer>
        <div class="max-w-4xl mx-auto text-center">
          <div class="flex justify-center mb-6">
            <div class="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
              <UIcon name="i-heroicons-building-library" class="w-16 h-16 text-primary-500"/>
            </div>
          </div>
          <h1 class="text-5xl font-bold mb-4 bg-linear-to-r from-primary-600 to-purple-600 dark:from-primary-400 dark:to-purple-400 bg-clip-text text-transparent">
            About OdyFeed
          </h1>
          <p class="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Where Greek Mythology Meets the Decentralized Web
          </p>
        </div>
      </UContainer>
    </div>

    <UContainer>
      <div class="max-w-5xl mx-auto pb-12">
        <div class="mb-16">
          <UCard class="shadow-lg">
            <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">What is OdyFeed?</h2>
            <div class="space-y-4 text-gray-700 dark:text-gray-300">
              <p class="text-lg leading-relaxed">
                <strong>OdyFeed</strong> is an educational demonstration of modern decentralized web technologies,
                showcasing how to build a federated social network that respects user privacy and data sovereignty.
              </p>
              <p class="leading-relaxed">
                The application tells the story of Homer's Odyssey through the eyes of mythological characters
                (Odysseus, Poseidon, Athena), who "post" about events as they unfold. Users can authenticate
                with their Solid Pod, create posts, interact with content, and federate with other ActivityPub
                servers—all while maintaining full control over their data.
              </p>
              <div class="grid md:grid-cols-3 gap-4 pt-4">
                <div class="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
                  <UIcon
                      name="i-heroicons-globe-alt"
                      class="w-6 h-6 text-purple-600 dark:text-purple-400 mt-0.5 shrink-0"/>
                  <div>
                    <div class="font-semibold text-gray-900 dark:text-white">ActivityPub</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">Federated social networking</div>
                  </div>
                </div>
                <div class="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                  <UIcon
                      name="i-heroicons-shield-check"
                      class="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0"/>
                  <div>
                    <div class="font-semibold text-gray-900 dark:text-white">Solid Pods</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">User-controlled storage</div>
                  </div>
                </div>
                <div class="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/10 rounded-lg">
                  <UIcon
                      name="i-heroicons-chat-bubble-left-right"
                      class="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5 shrink-0"/>
                  <div>
                    <div class="font-semibold text-gray-900 dark:text-white">Webmentions</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">Decentralized comments</div>
                  </div>
                </div>
              </div>
            </div>
          </UCard>
        </div>

        <div class="mb-16">
          <h2 class="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">Core Features</h2>
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <UCard
                v-for="feature in features"
                :key="feature.title"
                class="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-t-4"
                :class="`border-${feature.color}-500`"
            >
              <div class="space-y-3">
                <div class="flex items-center gap-3">
                  <div :class="`p-2 bg-${feature.color}-100 dark:bg-${feature.color}-900/20 rounded-lg`">
                    <UIcon
                        :name="feature.icon"
                        :class="`w-6 h-6 text-${feature.color}-600 dark:text-${feature.color}-400`"/>
                  </div>
                  <h3 class="font-semibold text-gray-900 dark:text-white">{{ feature.title }}</h3>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {{ feature.description }}
                </p>
              </div>
            </UCard>
          </div>
        </div>

        <div class="mb-16">
          <h2 class="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">Technology Stack</h2>
          <UCard class="shadow-lg">
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div
                  v-for="tech in technologies"
                  :key="tech.name"
                  class="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:shadow-md transition-shadow"
              >
                <UIcon :name="tech.icon" :class="`w-8 h-8 text-${tech.color}-600 dark:text-${tech.color}-400`"/>
                <div>
                  <div class="font-semibold text-gray-900 dark:text-white">{{ tech.name }}</div>
                  <div v-if="tech.version" class="text-xs text-gray-500 dark:text-gray-400">{{ tech.version }}</div>
                </div>
              </div>
            </div>
          </UCard>
        </div>

        <div class="mb-16">
          <h2 class="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">Why OdyFeed?</h2>
          <UCard class="shadow-lg">
            <p class="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              This project was created as a learning resource and proof-of-concept for understanding and implementing
              modern decentralized web standards in a practical context:
            </p>
            <ul class="space-y-3">
              <li class="flex items-start gap-3">
                <UIcon name="i-heroicons-check-circle" class="w-6 h-6 text-primary-500 mt-0.5 shrink-0"/>
                <span class="text-gray-700 dark:text-gray-300">
                  <strong>Understanding ActivityPub</strong> federation mechanics (inbox/outbox, HTTP signatures, actor discovery)
                </span>
              </li>
              <li class="flex items-start gap-3">
                <UIcon name="i-heroicons-check-circle" class="w-6 h-6 text-primary-500 mt-0.5 shrink-0"/>
                <span class="text-gray-700 dark:text-gray-300">
                  <strong>Implementing Solid OIDC</strong> authentication and Pod storage operations
                </span>
              </li>
              <li class="flex items-start gap-3">
                <UIcon name="i-heroicons-check-circle" class="w-6 h-6 text-primary-500 mt-0.5 shrink-0"/>
                <span class="text-gray-700 dark:text-gray-300">
                  <strong>Working with RDF/Turtle</strong> and Linked Data principles
                </span>
              </li>
              <li class="flex items-start gap-3">
                <UIcon name="i-heroicons-check-circle" class="w-6 h-6 text-primary-500 mt-0.5 shrink-0"/>
                <span class="text-gray-700 dark:text-gray-300">
                  <strong>Building modern web applications</strong> with Vue 3, Nuxt, and TypeScript
                </span>
              </li>
              <li class="flex items-start gap-3">
                <UIcon name="i-heroicons-check-circle" class="w-6 h-6 text-primary-500 mt-0.5 shrink-0"/>
                <span class="text-gray-700 dark:text-gray-300">
                  <strong>Exploring decentralized standards</strong> in a creative, narrative-driven context
                </span>
              </li>
            </ul>
          </UCard>
        </div>

        <div class="mb-16">
          <h2 class="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">Related Projects</h2>
          <article class="h-entry">
            <UCard class="shadow-lg border-l-4 border-primary-500 hover:shadow-xl transition-shadow">
              <div class="flex items-start gap-4">
                <div class="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-lg shrink-0">
                  <UIcon name="i-heroicons-star" class="w-8 h-8 text-primary-600 dark:text-primary-400"/>
                </div>
                <div class="flex-1">
                  <h3 class="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                    <span class="p-name">Exploring Decentralized Web Technologies with Stargazer</span>
                  </h3>
                  <div class="e-content text-gray-600 dark:text-gray-400 mb-4">
                    <p class="mb-2">
                      Check out <a
                        href="https://stargazer.kilianleroy.ikdoeict.be/"
                        class="u-in-reply-to text-primary-600 dark:text-primary-400 hover:underline"
                        rel="external">Stargazer by Kilian Leroy</a>,
                      an amazing related project exploring similar decentralized web technologies and concepts.
                    </p>
                    <p>
                      As fellow explorers of ActivityPub, Solid, and the decentralized web, we're excited to share and mention this project.
                    </p>
                  </div>

                  <div class="p-author h-card hidden">
                    <a href="https://artvdv.solidcommunity.net/profile/card#me" class="u-url u-uid p-name">Art Van der Vennet</a>
                    <a href="https://odyfeed.artvdv.ikdoeict.be/" class="u-url">OdyFeed</a>
                    <data class="p-note" value="OdyFeed - A decentralized social network exploring Greek mythology through ActivityPub, Solid, and Webmentions" />
                  </div>
                </div>
              </div>

              <div class="flex gap-3 mt-4">
                <UButton
                    to="https://stargazer.kilianleroy.ikdoeict.be/"
                    target="_blank"
                    icon="i-heroicons-arrow-top-right-on-square"
                    color="primary"
                    variant="soft"
                    size="sm"
                >
                  Visit Stargazer
                </UButton>
              </div>

              <a :href="`${baseUrl}/about`" class="u-url hidden">Permalink</a>
              <time class="dt-published hidden" :datetime="new Date('2026-01-20').toISOString()">2026-01-20</time>
            </UCard>
          </article>
        </div>

        <div>
          <h2 class="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">Contributors</h2>
          <UCard class="shadow-lg">
            <p class="text-gray-600 dark:text-gray-400 mb-6 text-center">
              This project was made possible by the following contributors:
            </p>
            <div class="space-y-4 max-w-2xl mx-auto">
              <solid-vcard-card profile="https://artvdv.solidcommunity.net/profile/card#me"/>
              <solid-vcard-card profile="https://storage.inrupt.com/b61b8d23-5783-4a83-88c6-fb5caaff66e2/profile"/>
            </div>
          </UCard>
        </div>
      </div>
    </UContainer>
  </div>
</template>
