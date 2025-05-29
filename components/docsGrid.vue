<template>
  <section class="grid-section" :hideHeader="hideHeader">
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

      <div class="grid">
        <slot>
          <docs-card v-for="i in 23" :key="i"></docs-card>
        </slot>
      </div>
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
</style>