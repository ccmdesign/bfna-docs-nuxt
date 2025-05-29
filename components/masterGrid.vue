<template>
  <div class="master-grid">
    <slot>
      <div class="aux-card" v-for="i in 47" :key="i">
        <p>Aux Card</p>
      </div>
    </slot>
  </div>
</template>

<script>
export default {
  name: 'Teste'
}
</script>

<style scoped>
.master-grid {
  box-sizing: content-box;
  padding-inline: var(--_center-padding, 1rem);
  max-inline-size: var(--_center-measure);
  margin-inline: auto;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-auto-rows: auto;
  gap: var(--base-gutter);
}

.aux-card {
  grid-column: span 12;
}

@media (min-width: 321px) and (max-width: 768px) {
  .aux-card {
    grid-column: span 6;
  }
}

@media (min-width: 769px) {
  .aux-card {
    grid-column: span 3;
  }
}
</style>
