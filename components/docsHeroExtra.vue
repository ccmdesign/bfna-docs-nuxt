<template>
  <div v-if="!isPlaying" class="doc-hero-extra">
    <slot>
      <docs-card v-if="!isMobile && route.name !== 'index' && hasTrailer" 
      :video="currentVideo" 
      :hideSeriesChip="true" 
      :thumbnail="true" 
      style="width: 50%;"
      :cardId="currentVideo.videoId"
      :hoveredCard="hoveredCardId"
      :isTrailer="hasTrailer"
      @setHoveredCard="(pay) => handleSetHoveredCard(pay)"
      @clearHoveredCard="handleClearHoveredCard"
      />
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

const hoveredCardId = ref(null);
const handleSetHoveredCard = (id) => {
  hoveredCardId.value = id;
}

const handleClearHoveredCard = () => {
  hoveredCardId.value = null;
}

const hasTrailer = computed(() => {
  return currentVideo.value.video_info.teaser_url ? 
  true : false;
});

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