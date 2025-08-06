<template>
  <docs-tabs id="tabs">
    <template #information>
      <div class="prose">
        <h2 class="font-size:-1" style="font-weight: bold;">{{currentVideo.video_info.column_1_title }}</h2>
        <p class="font-size:-1">{{ currentVideo.video_info.column_1_text }}</p>
        <h2 class="font-size:-1" style="font-weight: bold;">{{ currentVideo.video_info.column_2_title }}</h2>
        <p class="font-size:-1">{{ currentVideo.video_info.column_2_text }}</p>
      </div>
      <!-- <div class="extras">
        <docs-card />
        <docs-card />
      </div> -->
    </template>

    <template #series>
      <div v-if="!series.items.length" class="prose">
        <p>No series available for this documentary</p>
      </div>
      <docs-list :items="series.items" />
    </template>


    <template #extras>
      <docs-grid>
        <docs-card v-if="trailer" :video="trailer" :thumbnail="true" :key="trailer.id"></docs-card>
      </docs-grid>
    </template>

    <template #posters>
      <docs-grid>
        <docsRelatedItemsCard :resource="res" v-for="res in posters" :key="res.id" />
      </docs-grid>
    </template>
    
    <template #study>
      <docs-grid>
        <docsRelatedItemsCard :resource="res" v-for="res in studies" :key="res.id" />
      </docs-grid>
    </template>
  </docs-tabs>
</template>

<script setup>
import { useVideoStore } from '~/stores/video';

definePageMeta({
  name: 'video-detail',
})

const route = useRoute();
const videoStore = useVideoStore();
videoStore.setCurrentVideoFromSlug(route.params.slug);
const { currentVideo } = storeToRefs(videoStore);

const trailer = computed(() => {
  return currentVideo.value.video_info.teaser_url ? 
  {
    id: currentVideo.value.id,
    videoUrl: currentVideo.value.video_info.teaser_url,
    video_info: currentVideo.value.video_info,
  } : null;
});

const series = computed(() => {
  let serieInfo = {}
  const items = currentVideo.value.series.map(s => {
    const serie = videoStore.series.find(item => item.serieId === s.serieId);

    serieInfo = {
      title: serie.title,
      description: serie.description,
      videoId: serie.videoId
    };
    
    return serie.documentaries
  });

  return {
    ...serieInfo,
    items: items.flat()
  }
});

const posters = computed(() => {
  return currentVideo.value.resources.filter(resource => resource.type === 'image');
});

const studies = computed(() => {
  return currentVideo.value.resources.filter(resource => resource.type === 'pdf');
});

onUnmounted(() => {
  videoStore.setShowDetails(false);
});

const ogTitle = computed(() => currentVideo.value.title ? currentVideo.value.title : 'Bertelsmann Foundation documentaries')

const ogImage = computed(() => {
  let url = currentVideo.value.video_info?.thumb || currentVideo.value.video_info?.thumbnail;
  if (url && !url.startsWith('https://')) {
    url = 'https://' + url.replace(/^https?:\/\//, '');
  }
  return url;
});
const ogDescription = computed(() => {
  return currentVideo.value.description ? currentVideo.value.description : 'Bertelsmann Foundation documentaries focus on governance, economics, elections, social issues, the digital revolution, and most importantly, where these issues intersect.';
});

const keywords = computed(() => {
  return currentVideo.value.tags ? currentVideo.value.tags.join(', ') : 'Bertelsmann Foundation, documentaries, governance, economics, elections, social issues, digital revolution';
});

useSeoMeta({
  title: ogTitle,
  ogTitle: ogTitle,
  description: ogDescription,
  ogDescription: ogDescription,
  twitterTitle: ogTitle,
  twitterDescription: ogDescription,
  ogImage: ogImage,
  twitterImage: ogImage,
  ogImageWidth: 1200,
  ogImageHeight: 720,
  keywords: keywords,
});

</script>

<style scoped>
#tabs {
  /* 
    this should occupy the same rows as the homepage components, to have a consistent layout. 
  */ 
  grid-row: 4 / 9; 
}

.downloadable-docs {
  display: flex;
  justify-content: center;
}
</style>