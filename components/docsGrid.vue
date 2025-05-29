<template>
  <section class="docs-grid" :hideHeader="hideHeader">
    <div class="center">
      <div v-if="!hideHeader" class="cluster">
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

    <div class="docs-grid__grid | center">
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
.docs-grid {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto auto;
  grid-template-areas:
    "header"
    "grid";
}

.docs-grid__grid {
  grid-area: grid;
  display: grid;
  gap: var(--_grid-gap, var(--base-gutter));
  grid-template-columns: 1fr;

  @media (min-width: 321px) and (max-width: 768px) {
    grid-template-columns: repeat(2, minmax(266px, 1fr));
  }

  @media (min-width: 769px) {
    grid-template-columns: repeat(4, minmax(266px, 1fr));
  }
}
</style>