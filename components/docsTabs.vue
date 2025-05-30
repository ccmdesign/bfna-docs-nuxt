<template>
  <div class="docs-tabs | subgrid">
    <div class="docs-tabs__tabs | subgrid cluster">
      <button 
        v-for="(tab, index) in tabs"
        :key="index"
        :class="['tab-button', { active: activeTab === index }]"
        @click="activeTab = index">
          {{ tab.label }} 
          <span class="tab-button__count">({{ tab.count }})</span>
        </button>
    </div>

    <div :class="['docs-tabs__content | subgrid', tabs[activeTab].class]">
      <slot :name="tabs[activeTab].slot" :class="tabs[activeTab].class"></slot>
    </div>
  </div>
</template>

<script setup>
const tabs = [
  { label: 'Information', slot: 'information', count: 1, class: '' },
  { label: 'Series', slot: 'series', count: 4, class: '' },
  { label: 'Trailer & More', slot: 'extras', count: 1, class: '' },
  { label: 'Related', slot: 'related', count: 1, class: '' }
]

const activeTab = ref(0)
</script>

<style scoped>
.docs-tabs {
  grid-column: content-start / content-end;
  display: grid;
  grid-template-columns: subgrid;
  
}

.docs-tabs__tabs {
  cursor: pointer;
  background-color: transparent;
  margin-inline: var(--space-2xs);
  border-bottom-width: 2px;
  border-bottom-style: solid;
  border-bottom-color: transparent;
  border-bottom: 1px solid var(--white-color-20-shade);
  --_cluster-space: var(--space-m);
}

.tab-button {
  padding: var(--space-2xs) 0;
  padding-bottom: var(--space-xs);
  border: 0;
  background-color: transparent;
  color: var(--white-color);
  font-weight: 300;
  font-size: var(--size-0);
  transition: all 0.2s ease-in-out;
}

.tab-button__count {
  color: var(--white-color-50-shade);
  font-weight: 300;
}

.tab-button.active {
  font-weight: 600;
  border-bottom-color: var(--white-color-70-shade);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: var(--white-color);
  }
}

.docs-tabs__content {
  grid-column: content-start / content-end;
  display: grid;
  grid-template-columns: subgrid;
  padding-block: var(--space-m);
}

:deep(.prose) {
  grid-column: content-start / content-end;
  
  @media (min-width: 768px) {
    grid-column: content-start / 9;
  }
}

@media (max-width: 768px) {
  :deep(.card) { grid-column: span 1; }
}

:deep(.extras) {
  grid-column: content-start / content-end;
  @media (min-width: 768px) { grid-column: 10 / content-end; }

  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-m);
  align-self: flex-start;

  @media (max-width: 768px) {
    margin-top: var(--space-m);
  }

  
}
</style>
