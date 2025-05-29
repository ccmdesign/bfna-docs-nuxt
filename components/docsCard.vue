<template>
  <div class="card">
    <slot name="content">
      <div class="stack">
        <h2><nuxt-link to="/detail-page">Card Title</nuxt-link></h2>
        <p>Card Description</p>
      </div>
    </slot>
  </div>
</template>

<script setup>
</script>

<style scoped>
.card {
  outline: 2px solid blue;
  background-color: rgba(0, 0, 255, 0.1);
  padding: 1rem;
  border-radius: 0.5rem;
  width: minmax(266px, 100%);
  aspect-ratio: 16 / 9;
}
</style>
