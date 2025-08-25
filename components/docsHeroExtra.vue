<template>
  <div v-if="!isPlaying" class="doc-hero-extra">
    <slot>
      <docs-card v-if="!isMobile && route.name !== 'index'" :video="currentVideo" :hideSeriesChip="true" :thumbnail="true" style="width: 50%;"/>
      <docs-awards v-if="currentVideo.awards.length" />
    </slot>
  </div>
</template>

<script setup>
import { useVideoStore } from '~/stores/video';
import { storeToRefs } from 'pinia';

const route = useRoute();
const videoStore = useVideoStore();
const { isPlaying, currentVideo } = storeToRefs(videoStore);

const isMobile = computed(() => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 768px)').matches;
})

</script>

<style lang="scss" scoped>
.doc-hero-extra {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: end;
  gap: 1rem;
  margin-bottom: 2rem;
}

</style>