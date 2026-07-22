<template>
  <div v-if="!isPlaying && !isMobile" class="doc-hero-extra">
    <slot>
      <docs-awards v-if="currentVideo.awards.length" />
    </slot>
  </div>
</template>

<script setup>
import { useVideoStore } from '~/stores/video';;
import { storeToRefs } from 'pinia';

const videoStore = useVideoStore();
const { isPlaying, currentVideo } = storeToRefs(videoStore);

const isMobile = computed(() => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 768px)').matches;
})

</script>

<style scoped>
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