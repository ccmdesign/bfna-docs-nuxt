<template>
  <span class="meta-info">
    <slot></slot>
  </span>
</template>

<script setup>
</script>

<style scoped>
.meta-info {
  font-size: var(--size--2);
  font-weight: 400;
  letter-spacing: 0.04em;
  color: var(--white-color-60-shade);
  display: inline-block;
  line-height: 1;
  padding: var(--space-3xs) var(--space-2xs);
  background-color: var(--white-color-10-shade); 
}
</style>
