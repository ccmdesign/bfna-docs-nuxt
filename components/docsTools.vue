<template>
  <section class="docs-tools | subgrid">
    <slot>
      <div class="cluster">
        <h2 class="h4" split-right>All Documentaries</h2>
        
        <select>
          <option value="all">All</option>
          <option value="documentary">Documentary</option>
          <option value="fiction">Fiction</option>
          <option value="animation">Animation</option>
        </select>

        <button>All Duration Range</button>
        <button>Sorted by: Recent</button>
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
