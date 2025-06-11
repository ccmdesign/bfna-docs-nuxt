<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
import { useVideoStore } from '~/stores/video'

const videoStore = useVideoStore();

const { data: featured } = await useAsyncData('featuredvideo', () => queryCollection('featuredvideo').first())
videoStore.setCurrentVideo(featured.value);

const { data: fourvideos } = await useAsyncData('fourvideos', () => queryCollection('fourvideos').order('featuredOrder', 'ASC').all())
videoStore.setFeaturedList(fourvideos.value);

const { data: allvideos } = await useAsyncData('allvideos', () => queryCollection('allvideos').order('order', 'ASC').all())
videoStore.setVideos(allvideos.value);

const { data: latest } = await useAsyncData('latest', () => queryCollection('latest').order('order', 'ASC').all())
videoStore.setLatestVideos(latest.value);

</script>