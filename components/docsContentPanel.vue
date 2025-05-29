<template>
  <div class="content-panel">
    <div class="content-panel__main-content">
      <slot name="main-content">

      </slot>
    </div>
    <div class="content-panel__sidebar">
      <div class="stack">
        <slot name="sidebar">
          <h3>Sidebar Example from Component</h3>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.content-panel {
  display: grid;
  grid-template-columns: 4fr 2fr minmax(266px, 1fr);
  grid-template-rows: 1fr;
  grid-template-areas:
    "content spacer sidebar";
}

.content-panel__main-content {
  grid-area: content;
}

.content-panel__sidebar {
  grid-area: sidebar;
}
</style>
