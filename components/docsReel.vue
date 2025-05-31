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
  grid-column: content-start / content-end;
  
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
  block-size: auto;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-color: #fff #000;
  gap: var(--base-gutter);
}

.reel-grid::-webkit-scrollbar {
  block-size: 1rem;
}

.reel-grid::-webkit-scrollbar-track {
  background-color: #000;
}

.reel-grid::-webkit-scrollbar-thumb {
  background-color: #000;
  background-image: linear-gradient(#000 0, #000 0.25rem, #fff 0.25rem, #fff 0.75rem, #000 0.75rem);
}

.reel-grid > * {
  flex: 1 0 auto;
}

.reel-grid > * {
  block-size: 100%;
  flex-basis: auto;
  max-width: calc(75% - (var(--base-gutter)/1.4)); /* @NOTE: Magic number */

  @media (min-width: 321px) and (max-width: 768px) {
    max-width: calc(45% - (var(--base-gutter)/1.4)); /* @NOTE: Magic number */
  }

  @media (min-width: 769px) {
    max-width: calc(25% - (var(--base-gutter)/1.4)); /* @NOTE: Magic number */
  }
}
</style>