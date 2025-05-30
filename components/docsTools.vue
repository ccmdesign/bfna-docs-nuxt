<template>
  <section class="docs-tools | subgrid">
    <slot>
      <div class="cluster">
        <h2 class="h4" split-right>All Documentaries</h2>
        
        <docs-select>
          <option value="all">All</option>
          <option value="documentary">Documentary</option>
          <option value="fiction">Fiction</option>
          <option value="animation">Animation</option>
        </docs-select>

        <docs-button>All Duration Range</docs-button>
        <docs-button>Sorted by: Recent</docs-button>
      </div>
    </slot>
  </section>
</template>

<script setup>
</script>

<style scoped>

.docs-tools {
  grid-column: content-start / content-end;
  padding-block-start: var(--space-s-xl);
}
</style>
