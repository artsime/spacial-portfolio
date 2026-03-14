<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
// Global head configuration
useHead({
  htmlAttrs: {
    lang: 'en',
  },
  bodyAttrs: {
    class: 'antialiased',
  },
})
</script>
