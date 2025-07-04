<template>
  <span class="chip">
    <span class="material-symbols-outlined">format_list_bulleted</span>
    <span class="chip-label">Series</span>
  </span>
</template>

<script setup>
// No script needed for this simple chip
</script>

<style scoped>
.chip {
  display: inline-flex;
  align-items: center;
  background: var(--white-color-10-shade);
  color: var(--white-color);
  border-radius: 5px;
  padding: 2px 10px 2px 6px;
  font-size: 14px;
  font-weight: 500;
  gap: 4px;
}

.chip-icon {
  font-size: 18px;
  vertical-align: middle;
}

.chip-label {
  vertical-align: middle;
}

/* Make sure to include Material Icons in your project */
</style>