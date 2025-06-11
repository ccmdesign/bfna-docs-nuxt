<template>
    <docs-reel id="featured-reel">
      <template #reel>
        <docs-card v-for="i in videoStore.featuredVideosList" :video="i" thumbnail :key="i.id"></docs-card>
      </template>
    </docs-reel>

    <docs-tools id="latest-heading">
      <div class="cluster">
        <h2 class="h4" split-right>Latest Releases</h2>
        <docs-button icon="arrow_back_ios" size="s" />
        <docs-button icon="arrow_forward_ios" size="s" />
      </div>
    </docs-tools>

    <docs-reel id="latest-reel">
      <template #reel>
        <docs-card v-for="i in videoStore.latest" :video="i" :key="i.id"></docs-card>
      </template>
    </docs-reel>

    <docs-tools id="grid-heading" />
      
    <docs-grid id="grid" :videos="videoStore.videoList" />
</template>

<script setup>
import { useVideoStore } from '~/stores/video';

const videoStore = useVideoStore();

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