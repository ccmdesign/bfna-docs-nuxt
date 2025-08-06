<template>
    <docs-reel id="featured-reel" :style="featuredReelStyle">
      <template #reel>
        <docs-card v-for="i in videoStore.featuredVideosList" :video="i" poster :key="i.id"></docs-card>
        <!-- <docs-card v-for="i in 5" :video="i" poster :key="i.id"></docs-card> -->
      </template>
    </docs-reel>

    <docs-tools id="grid-heading" />
      
    <docs-grid id="grid" :videos="videoStore.videoList" />
</template>

<script setup>
import { useVideoStore } from '~/stores/video';
import { ref, onMounted, nextTick } from 'vue';

const videoStore = useVideoStore();

const featuredReelStyle = computed(() => {
  return videoStore.featuredVideosList.length === 4
    ? { justifyContent: 'space-around' }
    : {};
});

const latestReelRef = ref(null);

function scrollLatestReel(direction) {
  nextTick(() => {
    const root = latestReelRef.value?.$el || latestReelRef.value;
    const reel = root?.querySelector ? root.querySelector('.reel-grid') : null;
    console.log('scrolling', { root, reel });
    if (!reel) return;
    // Try to scroll by the width of one card, fallback to 300px
    const card = reel.querySelector('.card');
    const scrollAmount = card ? card.offsetWidth + 24 : 300; // 24px is a guess for gap
    reel.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
  });
}

onMounted(() => {
  // Ensure ref is properly set after component mount
  nextTick(() => {
    console.log('latestReelRef mounted:', latestReelRef.value);
  });
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