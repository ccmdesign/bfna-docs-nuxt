<template>
  <section class="docs-grid | subgrid">
    <slot>
      <docs-card v-for="video in videos" 
      :key="video.id" 
      :video="video"
      :cardId="video.videoId"
      :hoveredCard="hoveredCardId"
      @setHoveredCard="(pay) => handleSetHoveredCard(pay)"
      @clearHoveredCard="handleClearHoveredCard"
      />
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

const hoveredCardId = ref(null);
const handleSetHoveredCard = (id) => {
  hoveredCardId.value = id;
}

const handleClearHoveredCard = () => {
  hoveredCardId.value = null;
}

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