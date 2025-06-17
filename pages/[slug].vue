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
        <docs-card :video="currentVideo" :thumbnail="true" :key="currentVideo.id"></docs-card>
      </docs-grid>
    </template>

    <template #related>
      <docs-grid>
        <!-- <docs-card /> -->
         <div v-for="res in currentVideo.resources" :key="res.id" class="downloadable-docs">
          <NuxtLink v-if="res.extension === 'pdf'"
            external
            target="_blank"
            :to="res.url">
            <img src="/assets/cicle_pdf.png" />
          </NuxtLink>
         </div>
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