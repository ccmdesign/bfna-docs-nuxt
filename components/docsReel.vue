<template>
  <div class="reel-grid | subgrid">
    <slot name="reel">
      <docs-card v-for="i in 5" :key="i"></docs-card>
    </slot>
  </div>
</template>

<script setup>

</script>

<style scoped>

/* Reel Grid Layout - SubGrid */

.reel-grid {
  grid-column: full-start / full-end;
  
  @media (min-width: 769px) {
    display: block;
    overflow-x: auto;
  }

  /* display: grid;
  /* gap: var(--base-gutter);
  /* 
  /* scroll-snap-type: x mandatory;  /* Enable snap points */
  /* scroll-snap-align: start;       /* Snap to the start of each card */
  /* scroll-behavior: smooth;        /* Smooth scrolling */
  /* -webkit-overflow-scrolling: touch;  /* Enable smooth scrolling on iOS */
  /* -ms-overflow-style: none;       /* Hide scrollbar in IE and Edge */
}  

.reel-grid {
  display: flex;
  padding-block-end: var(--space-s-m);
  block-size: auto;
  overflow-x: auto;
  overflow-y: hidden;
  gap: var(--base-gutter);
}

.reel-grid::-webkit-scrollbar {
  height: 1px;
  
}

.reel-grid::-webkit-scrollbar-track {
  background-color: transparent;
}

.reel-grid::-webkit-scrollbar-thumb {
  background-color: var(--white-color-30-shade);
}

.reel-grid > * {
  flex: 1 0 auto;
}

.reel-grid > :first-child {
  margin-inline-start: calc(var(--space-xs-m) + var(--base-gutter));
}

.reel-grid > :last-child {
  margin-inline-end: calc(var(--space-xs-m) + var(--base-gutter));
}

.reel-grid > * {
  block-size: 100%;
  flex-basis: auto;
  max-width: calc(100% - (4* var(--space-xs-m)));

  @media (min-width: 321px) and (max-width: 768px) {
    max-width: 43.6%
  }

  @media (min-width: 769px) {
    max-width: calc(25% - var(--base-gutter)*2.25); /* @NOTE: Magic number */
  }
}
</style>