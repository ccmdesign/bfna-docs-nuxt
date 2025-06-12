<template>
    <docs-reel id="featured-reel">
      <template #reel>
        <docs-card v-for="i in videoStore.featuredVideosList" :video="i" thumbnail :key="i.id"></docs-card>
      </template>
    </docs-reel>

    <docs-tools id="latest-heading">
      <div class="cluster">
        <h2 class="h4" split-right>Latest Releases</h2>
        <docs-button icon="arrow_back_ios" size="s" @click="scrollLatestReel(-1)" />
        <docs-button icon="arrow_forward_ios" size="s" @click="scrollLatestReel(1)" />
      </div>
    </docs-tools>

    <docs-reel id="latest-reel" ref="latestReelRef">
      <template #reel>
        <docs-card v-for="i in videoStore.latest" :video="i" :key="i.id"></docs-card>
      </template>
    </docs-reel>

    <docs-tools id="grid-heading" />
      
    <docs-grid id="grid" :videos="videoStore.videoList" />
</template>

<script setup>
import { useVideoStore } from '~/stores/video';
import { ref, onMounted } from 'vue';

const videoStore = useVideoStore();

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