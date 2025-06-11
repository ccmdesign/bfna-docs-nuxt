<template>
  <section class="docs-grid | subgrid">
    <slot>
      <docs-card v-for="video in videos" :key="video.id" :video="video"></docs-card>
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