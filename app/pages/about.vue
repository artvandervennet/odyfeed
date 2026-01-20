<script setup lang="ts">
useSeoMeta({
  title: 'About OdyFeed',
  description: 'A decentralized social network that brings Greek mythology to the modern web through ActivityPub federation, Solid Pod storage, and Webmentions.',
})

const baseUrl = "https://odyfeed.artvandervennet.ikdoeict.be/about"
</script>
<template>
  <div>
    <UContainer>
      <div class="max-w-3xl mx-auto py-12">
        <div class="mb-12 text-center">
          <h1 class="text-4xl font-bold mb-3 text-gray-900 dark:text-white">About OdyFeed</h1>
          <p class="text-lg text-gray-600 dark:text-gray-400">
            Where Greek mythology meets the decentralized web
          </p>
        </div>

        <div class="mb-12">
          <UCard>
            <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">What is OdyFeed?</h2>
            <div class="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
              <p>
                <strong>OdyFeed</strong> is an educational demonstration of modern decentralized web technologies,
                showcasing how to build a federated social network that respects user privacy and data sovereignty.
              </p>
              <p>
                The application tells the story of Homer's Odyssey through the eyes of mythological characters
                (Odysseus, Poseidon, Athena), who "post" about events as they unfold. Users can authenticate
                with their Solid Pod, create posts, interact with content, and federate with other ActivityPub
                servers—all while maintaining full control over their data.
              </p>
            </div>
          </UCard>
        </div>

        <div class="mb-12">
          <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Core Features</h2>
          <UCard>
            <div class="space-y-6">
              <div>
                <h3 class="font-semibold text-gray-900 dark:text-white mb-1">Federated Social Networking</h3>
                <p class="text-gray-600 dark:text-gray-400 text-sm">
                  Full ActivityPub implementation with Follow, Like, Reply, and Announce. Compatible with Mastodon and other fediverse platforms.
                </p>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 dark:text-white mb-1">Solid Pod Integration</h3>
                <p class="text-gray-600 dark:text-gray-400 text-sm">
                  OAuth 2.0 / OIDC authentication with any Solid provider. Your data stays in your Pod with fine-grained access control.
                </p>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 dark:text-white mb-1">Webmention Support</h3>
                <p class="text-gray-600 dark:text-gray-400 text-sm">
                  Receive webmentions on posts and parse microformats2 for decentralized comments across the web.
                </p>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 dark:text-white mb-1">Mythological Narrative</h3>
                <p class="text-gray-600 dark:text-gray-400 text-sm">
                  Experience Homer's Odyssey through the eyes of Greek gods with AI-generated posts that match character personalities.
                </p>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 dark:text-white mb-1">Modern Web UI</h3>
                <p class="text-gray-600 dark:text-gray-400 text-sm">
                  Built with Vue 3 Composition API, Nuxt 4, and TypeScript. Responsive design with dark mode support.
                </p>
              </div>
            </div>
          </UCard>
        </div>

        <div class="mb-12">
          <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Technology Stack</h2>
          <UCard>
            <div class="flex flex-wrap gap-3">
              <span class="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300">
                Nuxt 4.2
              </span>
              <span class="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300">
                Vue 3.5
              </span>
              <span class="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300">
                TypeScript
              </span>
              <span class="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300">
                ActivityPub
              </span>
              <span class="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300">
                Solid Protocol
              </span>
              <span class="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300">
                Pinia Colada
              </span>
              <span class="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300">
                Webmentions
              </span>
            </div>
          </UCard>
        </div>

        <div class="mb-12">
          <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Why OdyFeed?</h2>
          <UCard>
            <p class="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              This project was created as a learning resource and proof-of-concept for understanding and implementing
              modern decentralized web standards in a practical context:
            </p>
            <ul class="space-y-3 text-gray-700 dark:text-gray-300">
              <li>
                <strong>Understanding ActivityPub</strong> — federation mechanics (inbox/outbox, HTTP signatures, actor discovery)
              </li>
              <li>
                <strong>Implementing Solid OIDC</strong> — authentication and Pod storage operations
              </li>
              <li>
                <strong>Working with RDF/Turtle</strong> — Linked Data principles
              </li>
              <li>
                <strong>Building modern web applications</strong> — Vue 3, Nuxt, and TypeScript
              </li>
              <li>
                <strong>Exploring decentralized standards</strong> — in a creative, narrative-driven context
              </li>
            </ul>
          </UCard>
        </div>

        <div class="mb-16">
          <h2 class="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">Related Projects</h2>
          <article class="h-entry">
            <UCard>
              <div>
                <h3 class="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  <span class="p-name">Exploring Decentralized Web Technologies with Stargazer</span>
                </h3>
                <div class="e-content text-gray-600 dark:text-gray-400 mb-4">
                  <p class="mb-2">
                    Check out <a
                      href="https://stargazer.kilianleroy.ikdoeict.be/extra"
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
                  <a href="https://odyfeed.artvandervennet.ikdoeict.be" class="u-url">OdyFeed</a>
                  <data class="p-note" value="OdyFeed - A decentralized social network exploring Greek mythology through ActivityPub, Solid, and Webmentions" />
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
          <UCard>
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
