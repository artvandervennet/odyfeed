<script setup lang="ts">
import {useSolidAuth} from "~/composables/useSolidAuth";

const { solidLogin, handleRedirect } = useSolidAuth();
onMounted(() => handleRedirect());
</script>

<template>
  <div>
    <h1>Welkom bij My Odyssey</h1>
    <button @click="solidLogin">Login met Solid</button>
  </div>
</template>
