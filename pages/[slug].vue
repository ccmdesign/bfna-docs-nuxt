<template>
  <docs-tabs id="tabs">
    <template #information>
      <div class="prose">
        <h2>{{currentVideo.video_info.column_1_title }}</h2>
        <p>{{ currentVideo.video_info.column_1_text }}</p>
        <h2>{{ currentVideo.video_info.column_2_title }}</h2>
        <p>{{ currentVideo.video_info.column_2_text }}</p>
      </div>
      <!-- <div class="extras">
        <docs-card />
        <docs-card />
      </div> -->
    </template>

    <template #series>
      <div v-if="series.items.length" class="prose" style="padding-bottom: 2.5rem;">
        <h2>{{series.title }}</h2>
        <p>{{ series.description }}</p>
      </div>
      <div v-else class="prose">
        <p>No series available for this documentary</p>
      </div>
      <docs-list :items="series.items" />
    </template>


    <template #extras>
      <docs-grid>
        <docs-card v-if="trailer" :video="trailer" :thumbnail="true" :key="trailer.id"></docs-card>
      </docs-grid>
    </template>

    <template #related>
      <docs-grid>
        <docsRelatedItemsCard :resource="res" v-for="res in currentVideo.resources" :key="res.id" />
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

onUnmounted(() => {
  videoStore.setShowDetails(false);
});

const ogTitle = computed(() => currentVideo.value.title ? currentVideo.value.title : 'Bertelsmann Foundation documentaries')

const ogImage = computed(() => {
  return currentVideo.value.video_info?.thumb || currentVideo.value.video_info?.thumbnail;
});
const ogDescription = computed(() => {
  return currentVideo.value.description ? currentVideo.value.description : 'Bertelsmann Foundation documentaries focus on governance, economics, elections, social issues, the digital revolution, and most importantly, where these issues intersect.';
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
});

// useHead({
//   title: `Bertelsmann Foundation documentaries | ${currentVideo.value.title}`,
//   meta: [
//     { property: 'og:title', content: `Breaking barriers, Building bridges | ${currentVideo.value.title}` },
//     { name: "description", content: ogDescription },
//     { property: 'og:description', content: ogDescription },
//     { name: 'twitter:title', content: currentVideo.value.title ? currentVideo.value.title : 'Bertelsmann Foundation documentaries' },
//     { name: 'twitter:description', content: ogDescription },
//     { property: 'og:image', content: ogImage },
//     { name: 'twitter:image', content: ogImage }
//   ]
// })

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