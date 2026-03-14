<template>
  <div class="loading">
    <div class="spinner" />
  </div>
</template>

<script setup lang="ts">
const router = useRouter()

onMounted(() => {
  router.replace('/world')
})

useHead({
  title: 'Portfolio - Spatial Design Experience',
})
</script>

<style scoped lang="scss">
.loading {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f7f4;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 2px solid #e0e0e0;
  border-top-color: #1a1a1a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
