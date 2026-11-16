<script setup lang="ts">
</script>
<template>
  <!-- Every page is a stack of painted bands (Gesso's page anatomy). The header is sticky and
       wears the paint of the band above the one being read. -->
  <div class="page">
    <AppHeader/>
    <main>
      <slot/>
    </main>
    <footer class="band page-footer site-footer" data-paint="deep">
      <AppFooter/>
    </footer>
  </div>
</template>
