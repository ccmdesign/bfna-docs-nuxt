<template>
  <input class="docs-search" type="text" placeholder="Search"/>
</template>

<script setup>
</script>

<style scoped>
.docs-search {
  width: 100%;
  padding: var(--space-2xs) var(--space-s);
  border: none;
  border-radius: 30px;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: var(--white-color);
  font-size: var(--size--1);
  font-weight: 300;
  letter-spacing: 0.04em;
  text-decoration: none;

  &::placeholder {
    color: var(--white-color);
  }
}
</style>
