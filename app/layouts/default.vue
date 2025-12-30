<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans">
    <AppHeader />
    <main class="py-10">
      <slot />
    </main>
    <footer class="border-t border-gray-200 dark:border-gray-800 py-8">
      <UContainer>
        <p class="text-center text-sm text-gray-500">
          &copy; 2025 OdyFeed. Built with Nuxt and ActivityPub.
        </p>
      </UContainer>
    </footer>
  </div>
</template>
