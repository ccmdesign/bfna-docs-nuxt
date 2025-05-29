<template>
  <div class="content-panel">
    <div class="content-panel__main-content">
      <slot name="main-content">

      </slot>
    </div>
    <div class="content-panel__sidebar | grid" :sidebarTitle="sidebarTitle">
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
  grid-template-columns: 1fr;
  grid-template-rows: auto auto;
  grid-template-areas:
    "content"
    "sidebar";

  @media (min-width: 768px) {
    grid-template-columns: 3fr minmax(266px, 1fr);
    grid-template-rows: 1fr;
    grid-template-areas:
      "content sidebar";
  }
}

.content-panel__main-content {
  grid-area: content;
}

.content-panel__sidebar {
  grid-area: sidebar;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto auto;
  grid-template-areas:
    "sidebar-header"
    "sidebar-content";
}

.content-panel__sidebar-items {
  display: grid;
  grid-template-columns: 1fr;
  
  @media (min-width: 321px) and (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
