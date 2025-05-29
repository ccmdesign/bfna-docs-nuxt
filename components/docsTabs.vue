<template>
  <div class="docs-tabs">
    <div class="center">
      <div class="tabs-container cluster">
        <button v-for="(tab, index) in tabs" :key="index" :class="['tab-button', { active: activeTab === index }]" @click="activeTab = index">{{ tab.label }}</button>
      </div>

      <div class="tab-content">
        <slot :name="tabs[activeTab].slot"></slot>
      </div>
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
  .tabs-container {
    
  }

  .tab-button {
    cursor: pointer;
    background-color: transparent;
    border: none;
    border-bottom: 1px solid black;


    &:hover {
      color: yellow;
    }

    &.active {
      color: green;
      border-color: green;
    }
  }

  .tab-content {
    padding: 1rem 0;
  }
}
</style>
