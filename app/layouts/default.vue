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
    <AppFooter />
  </div>
</template>
