<template>
    <docs-reel id="featured-reel" :style="featuredReelStyle">
      <template #reel>
        <docs-card v-for="i in videoStore.featuredVideosList" :video="i" poster :key="i.id"></docs-card>
        <!-- <docs-card v-for="i in 5" :video="i" poster :key="i.id"></docs-card> -->
      </template>
    </docs-reel>

    <docs-tools id="grid-heading" />
      
    <docs-grid id="grid" :videos="videos" />
</template>

<script setup>
import { useVideoStore } from '~/stores/video';

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

const featuredReelStyle = computed(() => {
  return videoStore.featuredVideosList.length === 4
    ? { justifyContent: 'space-around' }
    : {};
});

</script>

<style scoped>
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