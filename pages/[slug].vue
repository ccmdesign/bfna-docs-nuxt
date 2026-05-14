<template>
  <docs-tabs id="tabs">
    <template #information>
      <div class="prose">
        <div class="font-size:-1 prose" v-html="currentVideo?.video_info?.description ?? ''"></div>
      </div>
      <div class="extras">
        <docs-card :video="currentVideo" poster :border=true style="max-width: fit-content;"></docs-card>

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
  const seriesList = currentVideo.value?.series || []
  let serieInfo = { title: '', description: '', videoId: null }
  const items = seriesList.map((s) => {
    const serie = videoStore.series.find((item) => item.serieId === s?.serieId)
    if (serie) {
      serieInfo = { title: serie.title, description: serie.description, videoId: serie.videoId }
      return serie.documentaries || []
    }
    return []
  })
  return { ...serieInfo, items: items.flat() }
})

const studies = computed(() => {
  const resources = currentVideo.value?.resources || []
  return resources.filter((r) => {
    const t = (r?.type || '').toLowerCase()
    const isPdf = t === 'application/pdf' || t === 'pdf' || (t === 'file' && (r?.extension || '').toLowerCase() === 'pdf')
    const hasLinks = Array.isArray(r?.links) && r.links.length > 0
    return isPdf || hasLinks
  })
})

const relatedItems = computed(() => {
  const relatedIds = currentVideo.value?.relatedDocumentaries || []
  if (relatedIds.length) {
    return videoList.value.filter((item) => relatedIds.includes(Number(item?.videoId)))
  }
  const tags = currentVideo.value?.tags || []
  if (!Array.isArray(tags)) return []
  return videoList.value.filter(
    (item) =>
      item?.id !== currentVideo.value?.id &&
      item?.tags?.some((tag) => tags.includes(tag))
  )
})
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

.prose * {
  font-size: 1em;
}
</style>