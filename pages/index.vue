<template>
  <docs-tools id="latest-heading">
    <div class="cluster">
      <h2 class="h3" split-right>Latest Releases & Featured Films</h2>
    </div>
  </docs-tools>

  <docs-reel id="featured-reel">
    <template #reel>
      <docs-card v-for="i in 5" :key="i" poster="true"></docs-card>
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

h2 { font-weight: bold; }

#latest-heading
#grid-heading,
#grid {
  z-index: 1;
}
</style>
