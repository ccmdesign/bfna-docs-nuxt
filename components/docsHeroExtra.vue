<template>
  <div v-if="!isPlaying && !isLanding" class="doc-hero-extra">
    <slot>
      <docs-awards v-if="currentVideo.awards.length" />
    </slot>
  </div>
</template>

<script setup>
import { useVideoStore } from '~/stores/video';
import { useLandingStore } from '~/stores/landing';
import { storeToRefs } from 'pinia';

const videoStore = useVideoStore();
const { isPlaying, currentVideo } = storeToRefs(videoStore);
const landingStore = useLandingStore();
const { isLanding } = storeToRefs(landingStore);

</script>

<style lang="scss" scoped>
.doc-hero-extra {
  max-height: 340px;
  overflow-y: scroll;
  scrollbar-width: none;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: start;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

</style>