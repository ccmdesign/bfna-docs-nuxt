<template>
  <div class="docs-tabs | subgrid">
    <div v-if="tabs.length" class="docs-tabs__tabs | subgrid cluster">
      <button 
        v-for="(tab, index) in tabs"
        :key="index"
        :class="['tab-button', { active: activeTab === index }]"
        @click="activeTab = index">
          {{ tab.label }} 
          <span v-if="tab.showCounter" class="tab-button__count">({{ tab.count }})</span>
        </button>
    </div>

    <div v-if="tabs.length" :class="['docs-tabs__content | subgrid', tabs[activeTab]?.class]">
      <slot :name="tabs[activeTab]?.slot || 'information'" :class="tabs[activeTab]?.class"></slot>
    </div>
  </div>
</template>

<script setup>
import { useVideoStore } from '~/stores/video';
const videoStore = useVideoStore();
const { currentVideo, relatedLength } = storeToRefs(videoStore);

const seriesLength = computed(() => {
  const series = currentVideo.value?.series || []
  return series.reduce((acc, serie) => acc + (serie?.items?.length ?? 0) + 1, 0)
})

const seriesTitle = computed(() => {
  const series = currentVideo.value?.series || []
  if (!series.length) return ''
  const firstSerieId = series[0]?.serieId
  const serie = videoStore.series.find((s) => s.serieId === firstSerieId)
  return serie?.title ?? ''
})

const trailerLength = computed(() => {
  const url = currentVideo.value?.video_info?.teaser_url
  return url ? url.length : 0
})

const informationLength = computed(() => {
  const desc = currentVideo.value?.video_info?.description
  return desc ? String(desc).length : 0
})

const studiesLength = computed(() => {
  const resources = currentVideo.value?.resources || []
  return resources.reduce((total, r) => {
    const t = (r?.type || '').toLowerCase()
    const isPdf = t === 'application/pdf' || t === 'pdf' || (t === 'file' && (r?.extension || '').toLowerCase() === 'pdf')
    const linkCount = Array.isArray(r?.links) ? r.links.length : 0
    const hasLinks = linkCount > 0
    if (!isPdf && !hasLinks) return total
    if (hasLinks && isPdf) return total + 1 + linkCount
    if (hasLinks) return total + linkCount
    return total + 1
  }, 0)
})

const information = { label: 'Information', slot: 'information', count: 1, class: '', showCounter: false };
const series = { label: seriesTitle.value, slot: 'series', count: seriesLength, class: '', showCounter: true };
const trailer = { label: 'Trailer', slot: 'extras', count: 1, class: '', showCounter: true };
const study = { label: 'Study Guide', slot: 'study', count: studiesLength, class: '', showCounter: true };
const related = { label: 'Related', slot: 'related', count: relatedLength, class: '', showCounter: true };

const tabs = computed(() => {
  const tablist = []
  if(informationLength.value > 0) {
    tablist.unshift(information);
  }
  if(seriesLength.value > 0) {
    tablist.unshift(series);
  }
  if(trailerLength.value > 0) {
    tablist.push(trailer);
  }
  if(studiesLength.value > 0) {
    tablist.push(study);
  }
  if(relatedLength.value > 0) {
    tablist.push(related);
  }

  return tablist;
});

const activeTab = ref(0)
watch(tabs, (t) => {
  const idx = t.findIndex((tab) => tab.label === 'Information')
  if (idx >= 0) activeTab.value = idx
}, { immediate: true })
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
  margin-left: 0;
  border-bottom-width: 2px;
  border-bottom-style: solid;
  border-bottom-color: transparent;
  border-bottom: 1px solid var(--white-color-20-shade);
  --_cluster-space: var(--space-m);

  @media (max-width: 768px) {
    flex-wrap: nowrap;
    overflow-x: auto;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
    gap: 0.5rem;
  }
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

  @media (max-width: 768px) {
    white-space: nowrap;
  }
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

  @media (max-width: 768px) {
    display: block;
  }
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
