<script setup lang="ts">
useSeoMeta({
  title: 'About OdyFeed',
  description: 'A decentralized social network that brings Greek mythology to the modern web through ActivityPub federation, Solid Pod storage, and Webmentions.',
})

const baseUrl = "https://odyfeed.vandervennet.art"

// The vCard element comes with a look of its own; Gesso repaints the cards to match the page.
const contributors = ref<HTMLElement | null>(null)
let stopPainting: (() => void) | undefined

onMounted(async () => {
  const { paintVcards } = await import('@vandervennet/gesso/components/vcard-paint.js')
  if (contributors.value) stopPainting = paintVcards(contributors.value)
})

onBeforeUnmount(() => stopPainting?.())
</script>
<template>
  <div>
    <div id="top" class="band hero" data-paint="deep">
      <div class="inner">
        <h1>About <art-stroke pigment="stroke" seed="about" animate>OdyFeed</art-stroke></h1>
        <p class="lead">Where Greek mythology meets the decentralized web</p>
      </div>
      <art-drip class="band-drip" pigment="--surface" seed="about" count="9" stagger flush/>
    </div>

    <section class="band section" data-paint="1" aria-labelledby="what-h">
      <div class="inner">
        <div class="section-head">
          <h2 id="what-h" class="section-title">What is OdyFeed?</h2>
        </div>
        <div class="section-body longform">
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
      </div>
    </section>

    <section class="band section" data-paint="2" aria-labelledby="features-h">
      <div class="inner">
        <div class="section-head">
          <h2 id="features-h" class="section-title">Core Features</h2>
        </div>
        <div class="section-body">
          <ul class="card-grid">
            <li class="card">
              <h3>Federated Social Networking</h3>
              <p>
                Full ActivityPub implementation with Follow, Like, Reply, and Announce. Compatible with Mastodon and other fediverse platforms.
              </p>
            </li>
            <li class="card">
              <h3>Solid Pod Integration</h3>
              <p>
                OAuth 2.0 / OIDC authentication with any Solid provider. Your data stays in your Pod with fine-grained access control.
              </p>
            </li>
            <li class="card">
              <h3>Webmention Support</h3>
              <p>
                Receive webmentions on posts and parse microformats2 for decentralized comments across the web.
              </p>
            </li>
            <li class="card">
              <h3>Mythological Narrative</h3>
              <p>
                Experience Homer's Odyssey through the eyes of Greek gods with AI-generated posts that match character personalities.
              </p>
            </li>
            <li class="card">
              <h3>Modern Web UI</h3>
              <p>
                Built with Vue 3 Composition API, Nuxt 4, and TypeScript. Responsive design with dark mode support.
              </p>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section class="band section" data-paint="3" aria-labelledby="stack-h">
      <div class="inner">
        <div class="section-head">
          <h2 id="stack-h" class="section-title">Technology Stack</h2>
        </div>
        <div class="section-body">
          <ul class="tapes">
            <li><art-tape seed="nuxt">Nuxt 4.2</art-tape></li>
            <li><art-tape seed="vue">Vue 3.5</art-tape></li>
            <li><art-tape seed="ts">TypeScript</art-tape></li>
            <li><art-tape seed="ap">ActivityPub</art-tape></li>
            <li><art-tape seed="solid">Solid Protocol</art-tape></li>
            <li><art-tape seed="colada">Pinia Colada</art-tape></li>
            <li><art-tape seed="wm">Webmentions</art-tape></li>
            <li><art-tape seed="gesso">Gesso</art-tape></li>
          </ul>
        </div>
      </div>
    </section>

    <section class="band section" data-paint="4" aria-labelledby="why-h">
      <div class="inner">
        <div class="section-head">
          <h2 id="why-h" class="section-title">Why OdyFeed?</h2>
        </div>
        <div class="section-body longform">
          <p>
            This project was created as a learning resource and proof-of-concept for understanding and implementing
            modern decentralized web standards in a practical context:
          </p>
          <ul class="plain-list">
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
        </div>
      </div>
    </section>

    <section class="band section" data-paint="5" aria-labelledby="related-h">
      <div class="inner">
        <div class="section-head">
          <h2 id="related-h" class="section-title">Related Projects</h2>
        </div>
        <div class="section-body">
          <article class="h-entry card related">
            <h3 class="p-name">Exploring Decentralized Web Technologies with Stargazer</h3>
            <div class="e-content">
              <p>
                Check out <a
                  href="https://stargazer.kilianleroy.ikdoeict.be/extra"
                  class="u-in-reply-to"
                  rel="external">Stargazer by Kilian Leroy</a>,
                an amazing related project exploring similar decentralized web technologies and concepts.
              </p>
              <p>
                As fellow explorers of ActivityPub, Solid, and the decentralized web, we're excited to share and mention this project.
              </p>
            </div>

            <div class="p-author h-card" hidden>
              <a href="https://artvdv.solidcommunity.net/profile/card#me" class="u-url u-uid p-name">Art Van der Vennet</a>
              <a href="https://odyfeed.vandervennet.art" class="u-url">OdyFeed</a>
              <data class="p-note" value="OdyFeed - A decentralized social network exploring Greek mythology through ActivityPub, Solid, and Webmentions" />
            </div>

            <art-button variant="secondary">
              <a href="https://stargazer.kilianleroy.ikdoeict.be/" target="_blank" rel="noopener">Visit Stargazer</a>
            </art-button>

            <a :href="`${baseUrl}/about`" class="u-url" hidden>Permalink</a>
            <time class="dt-published" :datetime="new Date('2026-01-20').toISOString()" hidden>2026-01-20</time>
          </article>
        </div>
      </div>
    </section>

    <section class="band section" data-paint="6" aria-labelledby="contributors-h">
      <div class="inner">
        <div class="section-head">
          <h2 id="contributors-h" class="section-title">Contributors</h2>
          <p class="intro">This project was made possible by the following contributors:</p>
        </div>
        <div ref="contributors" class="section-body stack">
          <solid-vcard-card profile="https://artvdv.solidcommunity.net/profile/card#me"/>
          <solid-vcard-card profile="https://storage.inrupt.com/b61b8d23-5783-4a83-88c6-fb5caaff66e2/profile"/>
        </div>
      </div>
    </section>
  </div>
</template>
