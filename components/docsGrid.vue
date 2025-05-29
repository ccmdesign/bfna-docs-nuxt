<template>
  <section class="docs-grid" :hideHeader="hideHeader">
    <div v-if="!hideHeader" class="docs-grid__headings">
      <div class="cluster">
        <h2 split-right>All Documentaries</h2>
        
        <select>
          <option value="all">All</option>
          <option value="documentary">Documentary</option>
          <option value="fiction">Fiction</option>
          <option value="animation">Animation</option>
        </select>

        <button>All Duration Range</button>
        <button>Sorted by: Most Recent</button>
      </div>
    </div>

    <div class="docs-grid__grid">
      <slot>
        <docs-card v-for="i in 23" :key="i"></docs-card>
      </slot>
    </div>
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
.docs-grid,
.docs-grid__headings,
.docs-grid__grid {
  display: grid;
  grid-template-columns: subgrid;
  grid-column: content-start / content-end;
}

.docs-grid__headings {
  .cluster {
    grid-column: inherit;
  }
}

.docs-grid {
  grid-template-rows: auto auto;
  grid-template-areas:
    "header"
    "grid";
}

.docs-grid__grid {
  gap: var(--_grid-gap, var(--base-gutter));
  grid-column: content-start / content-end;
}

:deep(.card) {
  display: grid;
  grid-template-columns: inherit;

  @media (max-width: 320px) { grid-column: content-start / content-end; }
  @media (min-width: 321px) and (max-width: 768px) { grid-column: span 2; }
  
  
}

</style>