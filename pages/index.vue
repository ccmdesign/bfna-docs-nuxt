<template>
  <master-grid>
    <docs-hero />

    <docs-reel hide-title>
      <template #reel>
        <docs-card v-for="i in 4" :key="i"></docs-card>
      </template>
    </docs-reel>

    <docs-reel>
      <template #title>
        <h2>Reel</h2>
        <button class="icon" split-left>arrow_back</button>
        <button class="icon">arrow_forward</button>
      </template>
      <template #reel>
        <docs-card v-for="i in 4" :key="i"></docs-card>
      </template>
    </docs-reel>
    <docs-grid />

    <docs-footer />
  </master-grid>
</template>

<script setup>

</script>

<style scoped>

</style>