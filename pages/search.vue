<script setup>
import { useVideoStore } from '~/stores/video';
import { useSearchStore } from '~/stores/search';
import { storeToRefs } from 'pinia';
import { onBeforeRouteLeave } from 'vue-router';

definePageMeta({
  layout: 'search',
});

const videoStore = useVideoStore();
const searchStore = useSearchStore();
const { searchValue, searchResults } = storeToRefs(searchStore);

const videos = computed(() => {
  return videoStore.videoList
});

watchEffect(async () => {
  if (searchValue.value) {
    await searchStore.doSearch(videos.value);
  }
});

onBeforeRouteLeave(() => {
  searchValue.value = '';
});

</script>

<template>
  <docs-grid v-if="searchResults.length" id="grid" :videos="searchResults" />
</template>

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
