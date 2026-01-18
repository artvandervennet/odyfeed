<script setup lang="ts">
</script>
<template>
  <div class="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
    <header>
      <UContainer>
        <AppHeader/>
      </UContainer>
    </header>
    <main>
      <UContainer>
        <slot/>
      </UContainer>
    </main>
    <footer class="border-t border-gray-200 dark:border-gray-800 py-8 mt-12">
      <AppFooter/>
    </footer>
  </div>
</template>
