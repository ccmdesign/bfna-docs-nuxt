<template>
  <section class="docs-grid | subgrid">
    <slot>
      <docs-card v-for="i in 23" :key="i"></docs-card>
    </slot>
  </section>
</template>

<script setup>
const props = defineProps({
  hideHeader: {
    type: Boolean,
    default: false
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