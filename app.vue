<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
import { useVideoStore } from '~/stores/video'

const videoStore = useVideoStore()

onMounted(() => {
  videoStore.fetchVideos()
})
</script>
