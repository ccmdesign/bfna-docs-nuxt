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

    <div v-if="tabs.length" :class="['docs-tabs__content | subgrid', tabs[activeTab].class]">
      <slot :name="tabs[activeTab].slot" :class="tabs[activeTab].class"></slot>
    </div>
  </div>
</template>

<script setup>
import { useVideoStore } from '~/stores/video';
const videoStore = useVideoStore();
const { currentVideo, relatedLength } = storeToRefs(videoStore);

const seriesLength = computed(() => {
  return currentVideo.value.series.reduce((acc, serie) => acc + serie.items.length + 1, 0);
});

const seriesTitle = computed(() => {
  if (!currentVideo.value.series.length) return '';
  const firstSerieId = currentVideo.value.series[0].serieId;
  const serie = videoStore.series.find(serie => serie.serieId === firstSerieId);
  return serie ? serie.title : '';
});

const trailerLength = computed(() => {
  return currentVideo.value.video_info.teaser_url ? currentVideo.value.video_info.teaser_url.length : 0;
});

const informationLength = computed(() => {
  return currentVideo.value.video_info && currentVideo.value.video_info.column_1_title ? currentVideo.value.video_info.column_1_title.length : 0;
});

const studiesLength = computed(() => {
  return currentVideo.value.resources.filter(resource => resource.type === 'pdf').length;
});

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
