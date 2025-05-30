<template>
  <div class="by-line | subgrid cluster">
    <span>© 2025 BFNA</span><span>Privacy</span><span>Terms</span>
    <a href="#" split-left>by ccm.design</a>
  </div>
</template>

<script setup>
</script>

<style scoped>
.by-line {
  grid-column: content-start / content-end;
  grid-row: 10 / 11;
  z-index: 1;
  font-size: var(--size--2);
  padding-block: var(--space-s);
  color: var(--white-color-50-shade);
  --_cluster-space: var(--space-xs);
}
</style>
