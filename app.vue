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
videoStore.setFeaturedVideo(featured.value);

const { data: fourvideos } = await useAsyncData('fourvideos', () => queryCollection('fourvideos').order('featuredOrder', 'ASC').all())
videoStore.setFeaturedList(fourvideos.value);

const { data: allvideos } = await useAsyncData('allvideos', () => queryCollection('allvideos').order('order', 'ASC').all())
videoStore.setVideos(allvideos.value);

const { data: latest } = await useAsyncData('latest', () => queryCollection('latest').order('order', 'ASC').all())
videoStore.setLatestVideos(latest.value);

const { data: series } = await useAsyncData('series', () => queryCollection('series').all())
videoStore.setSeries(series.value);

const { data: filters } = await useAsyncData('filters', () => queryCollection('filters').first())
videoStore.setFiltersItems(filters.value);

</script>