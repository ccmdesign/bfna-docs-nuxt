<template>
  <div v-if="!isPlaying" class="doc-hero-extra">
    <slot>
      <docs-awards v-if="currentVideo.awards.length" />
    </slot>
  </div>
</template>

<script setup>
import { useVideoStore } from '~/stores/video';
import { storeToRefs } from 'pinia';

const videoStore = useVideoStore();
const { isPlaying, currentVideo } = storeToRefs(videoStore);

</script>

<style lang="scss" scoped>

</style>