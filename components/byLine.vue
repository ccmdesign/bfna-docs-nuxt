<template>
  <div class="by-line | subgrid">
    <div class="by-line__content | cluster">
      <span>© 2025 BFNA</span><span>Privacy</span><span>Terms</span>
      <a href="#" split-left>by ccm.design</a>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>

/* By Line Layout - SubGrid */

.by-line {
  display: grid;
  grid-template-columns: subgrid;
  grid-column: full-start / full-end;
  font-size: var(--size--2);
  padding-block: var(--space-l) var(--space-s);
  color: var(--white-color-50-shade);
  background-color: var(--black-color-95-tint);
}

.by-line__content {
  grid-column: content-start / content-end;
  --_cluster-space: var(--space-xs);
}
</style>
