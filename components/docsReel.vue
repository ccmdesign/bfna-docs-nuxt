<template>
  <div class="reel-grid | subgrid">
    <slot name="reel">
      <docs-card v-for="i in 5" :key="i"></docs-card>
    </slot>
  </div>
</template>

<script setup>

</script>

<style lang="scss" scoped>

/* Reel Grid Layout - SubGrid */

.reel-grid {
  grid-column: content-start / content-end;
  display: grid;
  gap: var(--base-gutter);
  overflow-x: auto;
  scroll-snap-type: x mandatory;  /* Enable snap points */
  scroll-snap-align: start;       /* Snap to the start of each card */
  scroll-behavior: smooth;        /* Smooth scrolling */
  -webkit-overflow-scrolling: touch;  /* Enable smooth scrolling on iOS */
  -ms-overflow-style: none;       /* Hide scrollbar in IE and Edge */
}  
</style>