<script setup lang="ts">
</script>

<template>
  <UContainer>
    <div class="max-w-2xl mx-auto py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold mb-4">About OdyFeed</h1>
      </div>

      <UCard class="mb-6">
        <h2 class="text-xl font-semibold mb-3">What is OdyFeed?</h2>
        <p class="text-gray-700 dark:text-gray-300 mb-4">
          OdyFeed is a modern social feed application that brings together the best of decentralized web technologies.
          Built with Nuxt 3, it combines ActivityPub protocol with Solid Pod integration to create a unique storytelling platform.
        </p>
        <p class="text-gray-700 dark:text-gray-300">
          The application tells the story of Homer's Odyssey through the lens of ActivityStreams, where characters become actors
          and epic events become posts in a federated timeline. Users can authenticate via ActivityPods, interact with content,
          and store their data in their own Solid pods.
        </p>
      </UCard>

      <UCard class="mb-6">
        <h2 class="text-xl font-semibold mb-3">Why OdyFeed?</h2>
        <p class="text-gray-700 dark:text-gray-300 mb-4">
          This project was created as an educational demonstration of modern decentralized web technologies, showcasing:
        </p>
        <ul class="space-y-2 text-gray-700 dark:text-gray-300 ml-6">
          <li class="flex items-start gap-2">
            <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-primary-500 mt-0.5 shrink-0"/>
            <span><strong>ActivityPub Integration:</strong> Full support for federated social networking protocols</span>
          </li>
          <li class="flex items-start gap-2">
            <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-primary-500 mt-0.5 shrink-0"/>
            <span><strong>Solid Pod Storage:</strong> User data sovereignty with linked data principles</span>
          </li>
          <li class="flex items-start gap-2">
            <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-primary-500 mt-0.5 shrink-0"/>
            <span><strong>ActivityPods Authentication:</strong> Secure OIDC with PKCE flow</span>
          </li>
          <li class="flex items-start gap-2">
            <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-primary-500 mt-0.5 shrink-0"/>
            <span><strong>Webmention Support:</strong> Cross-site conversation and engagement tracking</span>
          </li>
          <li class="flex items-start gap-2">
            <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-primary-500 mt-0.5 shrink-0"/>
            <span><strong>Modern Architecture:</strong> Built with Nuxt 4, and TypeScript</span>
          </li>
        </ul>
      </UCard>

      <UCard>
        <h2 class="text-xl font-semibold mb-4">Contributors</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6 text-sm">
          This project was made possible by the following contributors:
        </p>
        <div class="space-y-4">
          <solid-vcard-card profile="https://artvdv.solidcommunity.net/profile/card#me"/>
          <solid-vcard-card profile="https://storage.inrupt.com/b61b8d23-5783-4a83-88c6-fb5caaff66e2/profile"/>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>
