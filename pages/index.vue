<template>
  <docs-reel id="featured-reel">
    <template #reel>
      <docs-card v-for="i in videoStore.featuredVideosList" :video="i" thumbnail :key="i.id"></docs-card>
    </template>
  </docs-reel>

  <docs-tools id="latest-heading">
    <div class="cluster">
      <h2 class="h4" split-right>Latest Releases</h2>
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


const latestReelRef = ref(null);

function scrollLatestReel(direction) {
  const root = latestReelRef.value?.$el || latestReelRef.value;
  const reel = root?.querySelector ? root.querySelector('.reel-grid') : null;
  console.log('scrolling', { root, reel });
  if (!reel) return;
  // Try to scroll by the width of one card, fallback to 300px
  const card = reel.querySelector('.card');
  const scrollAmount = card ? card.offsetWidth + 24 : 300; // 24px is a guess for gap
  reel.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
}

onMounted(() => {
  // Optionally, could do something here if needed
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
