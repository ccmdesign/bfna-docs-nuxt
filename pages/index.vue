<template>
  <docs-reel id="featured-reel">
    <template #reel>
      <docs-card v-for="i in videoStore.featuredVideosList" :video="i" thumbnail :featured="true" :key="i.id"></docs-card>
    </template>
  </docs-reel>

  <docs-tools id="latest-heading">
    <div class="cluster">
      <h2 class="h3" split-right>Latest Releases</h2>
      <docs-button icon="arrow_back_ios" size="s" @click="slideLeft" />
      <docs-button icon="arrow_forward_ios" size="s" @click="slideRight"/>
    </div>
  </docs-tools>

  <docs-reel id="latest-reel" ref="latestReel">
    <template #reel>
      <docs-card v-for="i in videoStore.latest" :video="i" :key="i.id"></docs-card>
    </template>
  </docs-reel>

  <docs-tools id="grid-heading" />
    
  <docs-grid id="grid" :videos="videos" />
</template>

<script setup>
import { useVideoStore } from '~/stores/video';
import { storeToRefs } from 'pinia';

const videoStore = useVideoStore();
const { filterOptions } = storeToRefs(videoStore);

const videos = computed(() => {

  return videoStore.videoList.filter(video => {
    // Filter by duration range
    if (filterOptions.value.durationRange !== 'all') {
      const duration = video.video_info.duration;
      const [min, max] = filterOptions.value.durationRange.split('-').map(Number);
      if (max) {
        if (duration < min || duration > max) {
          return false;
        }
      } else {
        if (duration < min) {
          return false;
        }
      }
    }
    return (filterOptions.value.workstream === 'all' || video.workstream === filterOptions.value.workstream);
  }).sort((a, b) => {
    return filterOptions.value.sort === 'desc' ? b.video_info.year - a.video_info.year : a.video_info.year - b.video_info.year;
  });
});

const latestReel = ref(null);

const slideLeft = () => {
  if (latestReel.value && latestReel.value.$el) {
    latestReel.value.$el.scrollBy({ left: -500, behavior: 'smooth' });
  }
};

const slideRight = () => {
  if (latestReel.value && latestReel.value.$el) {
    latestReel.value.$el.scrollBy({ left: 500, behavior: 'smooth' });
  }
};

</script>

<style scoped>

h2 {
  font-weight: bold;
}

#latest-reel {
  grid-row: 6 / 7;
  z-index: 1;
}

#grid-heading {
  grid-row: 7 / 8;
  z-index: 1;
}

#grid {
  grid-row: 8 / 9;
  z-index: 1;
}
</style>
