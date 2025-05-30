<template>
  <div class="docs-tabs">
    <div class="docs-tabs__container | cluster">
      <button v-for="(tab, index) in tabs" :key="index" :class="['tab-button', { active: activeTab === index }]" @click="activeTab = index">{{ tab.label }}</button>
    </div>

    <div class="docs-tabs__content">
      <slot :name="tabs[activeTab].slot"></slot>
    </div>
  </div>
</template>

<script setup>
const tabs = [
  { label: 'Series', slot: 'series' },
  { label: 'Information', slot: 'information' },
  { label: 'Trailer & More', slot: 'extras' },
  { label: 'Related', slot: 'related' }
]

const activeTab = ref(0)
</script>

<style scoped>
.docs-tabs {
  grid-column: content-start / content-end;
  display: grid;
  grid-template-columns: subgrid;
}

.docs-tabs__container {
  grid-column: content-start / content-end;
  cursor: pointer;
  background-color: transparent;

  &:hover {
    color: yellow;
  }

  &.active {
    color: green;
    border-color: green;
  }

}

.docs-tabs__content {
  padding: 1rem 0;
  grid-column: content-start / content-end;
  display: grid;
  grid-template-columns: subgrid;
}
</style>
