<template>
  <section class="reel-section">
    <h2 class="reel-section__title | cluster">
      <slot name="title"></slot>
    </h2>
    
    <div class="reel-grid">
        <slot name="reel">
          <docs-card v-for="i in 4" :key="i"></docs-card>
        </slot>
    </div>
  </section>
</template>

<script setup>

</script>

<style lang="scss" scoped>

/* Reel Grid Layout - SubGrid */

.reel-section {
  display: grid;
  grid-template-columns: subgrid;
  grid-column: content-start / content-end;
  grid-template-rows: auto auto;
  grid-template-areas:
    "title"
    "grid";
}

.reel-section__title {
  // NOTE: We need to define the grid-column here to ensure the title is full width
  grid-area: title;
  grid-column: inherit;
}

.reel-grid {
  // @TODO: we need to figure out a wat to horizontally scroll the grid
  grid-area: grid;
  display: grid;
  grid-template-columns: subgrid;
  grid-column: inherit;
}

.reel-grid {
  gap: var(--base-gutter);
  overflow-x: auto;
  scroll-snap-type: x mandatory;  /* Enable snap points */
  scroll-snap-align: start;       /* Snap to the start of each card */
  scroll-behavior: smooth;        /* Smooth scrolling */
  -webkit-overflow-scrolling: touch;  /* Enable smooth scrolling on iOS */
  -ms-overflow-style: none;       /* Hide scrollbar in IE and Edge */
}

/* This is hiding the 3rd and 4th cards on mobile and tablets.
   We should find a better way to handle this.
 */
:deep(.card) {
  height: 100%;
  width: 100%;
  @media (max-width: 768px) { 
    grid-column: span 2;
    &:nth-child(n+3) {display: none;}
    }
  }
</style>