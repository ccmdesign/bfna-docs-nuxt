<template>
  <div class="content-panel">
    <div class="content-panel__main-content">
      <slot name="main-content">

      </slot>
    </div>
    
    <div class="content-panel__sidebar" :sidebarTitle="sidebarTitle">
      <h3>{{ sidebarTitle }}</h3>
      <div class="content-panel__sidebar-items">
        <slot name="sidebar">
          <h3>Sidebar Example from Component</h3>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup>
  const props = defineProps({
    sidebarTitle: {
      type: String,
      default: 'Sidebar'
    }
  })
</script>

<style scoped>
.content-panel {
  display: grid;
  grid-template-columns: subgrid;
  grid-column: content-start / content-end;
}

.content-panel__main-content {
  grid-template-columns: subgrid;
  grid-column: span 3;
}

.content-panel__sidebar {
  display: grid;
  grid-template-columns: subgrid;
  grid-column: col3 / content-end;
}
</style>
