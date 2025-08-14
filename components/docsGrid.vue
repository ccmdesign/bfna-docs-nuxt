<template>
  <section class="docs-grid | subgrid">
    <slot v-if="isMobile">
      <docs-card-mobile v-for="video in videos" 
      :key="video.id" 
      :video="video"
      :is-video-active="activeVideoId === video.videoId"
      @card-clicked="handleCardClick"
      />
    </slot>
    <slot v-else>
      <docs-card v-for="video in videos" 
      :key="video.id" 
      :video="video"/>
    </slot>
  </section>
</template>

<script setup>
const props = defineProps({
  hideHeader: {
    type: Boolean,
    default: false
  },
  videos: {
    type: Array,
    default: () => []
  }
})

const isMobile = computed(() => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 768px)').matches;
})

const activeVideoId = ref(null);
const handleCardClick = ({cardId}) => {
  activeVideoId.value = cardId;
}
</script>

<style scoped>

/* Docs Grid Layout - SubGrid */
.docs-grid {
  grid-column: content-start / content-end;
  display: grid;
  gap: var(--base-gutter);
  padding-block-end: var(--space-s-m);
}



</style>