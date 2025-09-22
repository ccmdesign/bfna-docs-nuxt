<template>
  <docs-tabs id="tabs">
    <template #information>
      <div class="prose">
        <h2 class="font-size:-1" style="font-weight: bold;">{{currentVideo.video_info.column_1_title }}</h2>
        <p class="font-size:-1">{{ currentVideo.video_info.column_1_text }}</p>
        <h2 class="font-size:-1" style="font-weight: bold;">{{ currentVideo.video_info.column_2_title }}</h2>
        <p class="font-size:-1">{{ currentVideo.video_info.column_2_text }}</p>
      </div>
      <div class="extras">
        <docs-card :video="currentVideo" poster style="max-width: fit-content;"></docs-card>

      </div>
    </template>

    <template #series>
      <div v-if="!series.items.length" class="prose">
        <p>No series available for this documentary</p>
      </div>
      <docs-list :items="series.items" />
    </template>

    <template #extras>
      <docs-grid>
        <docs-card v-if="trailer" 
        :video="trailer" 
        :thumbnail="true" 
        :key="trailer.id"
        :cardId="trailer.id"
        :isTrailer="Boolean(trailer)"
        :hoveredCard="hoveredCardId"
        @setHoveredCard="(pay) => handleSetHoveredCard(pay)"
        @clearHoveredCard="handleClearHoveredCard"
        ></docs-card>
      </docs-grid>
    </template>
    
    <template #study>
      <docs-grid>
        <docsRelatedItemsCard :resource="res" v-for="res in studies" :key="res.id" />
      </docs-grid>
    </template>

    <template #related>
      <docs-grid>
        <docs-card v-for="item in relatedItems" 
        :video="item" 
        :thumbnail="true" 
        :key="item.videoId"
        :cardId="item.videoId"
        :hoveredCard="hoveredCardId"
        @setHoveredCard="(pay) => handleSetHoveredCard(pay)"
        @clearHoveredCard="handleClearHoveredCard"
        ></docs-card>
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
const { currentVideo, videoList } = storeToRefs(videoStore);

const hoveredCardId = ref(null);
const handleSetHoveredCard = (id) => {
  hoveredCardId.value = id;
}

const handleClearHoveredCard = () => {
  hoveredCardId.value = null;
}

const trailer = computed(() => {
  return currentVideo.value.video_info.teaser_url ? 
  { ... currentVideo.value, trailerUrl: currentVideo.value.video_info.teaser_url } : null;
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

const studies = computed(() => {
  return currentVideo.value.resources.filter(resource => resource.type === 'pdf' || resource.type === 'link');
});

const relatedItems = computed(() => {
  if (currentVideo.value.relatedDocumentaries.length) {
    return videoList.value.filter(item => 
      currentVideo.value.relatedDocumentaries.includes(item.videoId)
    );
  }

  if (!currentVideo.value.tags || !Array.isArray(currentVideo.value.tags)) return [];
  return videoList.value.filter(item => 
    item.id !== currentVideo.value.id && // Exclude current video
    item.tags &&
    item.tags.some(tag => currentVideo.value.tags.includes(tag))
  );
});
videoStore.setRelatedLength(relatedItems.value.length);

onUnmounted(() => {
  videoStore.setShowDetails(false);
});

const ogTitle = computed(() => currentVideo.value.title ? currentVideo.value.title : 'Bertelsmann Foundation documentaries')

const ogImage = computed(() => {
  let url = currentVideo.value.video_info?.thumb || currentVideo.value.video_info?.thumbnail;
  if (url && !url.startsWith('https://')) {
    url = 'https:' + url.replace(/^https?:\/\//, '');
  }
  return url;
});
const ogDescription = computed(() => {
  return currentVideo.value.description ? currentVideo.value.description : 'Bertelsmann Foundation documentaries focus on governance, economics, elections, social issues, the digital revolution, and most importantly, where these issues intersect.';
});

const keywords = computed(() => {
  return currentVideo.value.keywords ? currentVideo.value.keywords.join(', ') : 'Bertelsmann Foundation, documentaries, governance, economics, elections, social issues, digital revolution';
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