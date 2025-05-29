<template>
  <div class="stack">
    <docs-hero />
    
    <docs-reel>
      <template #reel>
        <docs-card v-for="i in 6" :key="i"></docs-card>
      </template>
    </docs-reel>
    
    <docs-reel>
      <template #title>
        <div class="cluster">
          <h2 split-right>Reel Title</h2>
          <button class="icon">arrow_back</button>
          <button class="icon">arrow_forward</button>
        </div>
      </template>
    
      <template #reel>
        <docs-card v-for="i in 6" :key="i"></docs-card>
      </template>
    </docs-reel>

    <docs-grid>
      <template #grid>
        <docs-card v-for="i in 23" :key="i"></docs-card>
      </template>
    </docs-grid>

    <docs-footer />
  </div>
</template>

<script setup>

</script>

<style scoped>

</style>