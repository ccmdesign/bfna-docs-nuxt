<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
import { useVideoStore } from '~/stores/video'

const videoStore = useVideoStore()

onMounted(() => {
  // Load Material Icons
  const materialIconsLink = document.createElement('link')
  materialIconsLink.rel = 'stylesheet'
  materialIconsLink.href = '/css/material-icons.css'
  document.head.appendChild(materialIconsLink)
  
  // Load perfect-scrollbar styles
  const scrollbarLink = document.createElement('link')
  scrollbarLink.rel = 'stylesheet'
  scrollbarLink.href = '/css/vue2-perfect-scrollbar.css'
  document.head.appendChild(scrollbarLink)
  
  videoStore.fetchVideos()
})
</script>
