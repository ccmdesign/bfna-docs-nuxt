<template>
  <div v-for="(award, index) in awards" :key="index" class="doc-awards">
    <img class="doc-awards__flag" src="/assets/award-ribbon.svg" alt="Award Ribbon" />
    <h4 class="doc-awards__title">{{ award.institution }}</h4>
    <div class="cluster doc-awards__meta">
      <span>{{ award.year }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useVideoStore } from '~/stores/video';

const videoStore = useVideoStore();
const { currentVideo } = storeToRefs(videoStore);

const awards = computed(() => currentVideo.value.awards);

</script>

<style lang="scss" scoped>
.doc-awards {
  width: 100%;
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto auto auto;
  grid-template-areas:
    "flag title title"
    "flag meta meta"
    "n counter controls";
}

.doc-awards__flag {
  grid-area: flag;
  aspect-ratio: 1/1;
  width: 25px;
  height: 52px;
  margin-inline-start: 0;
  object-fit: contain;
  object-position: center;
  margin-inline-end: var(--space-xs);
}

.doc-awards__title {
  grid-area: title;
  color: var(--primary-color);
}

.doc-awards__meta {
  grid-area: meta;
  --_cluster-space: var(--space-3xs);
}

.doc-awards__counter {
  grid-area: n;
  color: var(--primary-color);
}

.dot-container {
  grid-area: counter;
  justify-self: center;
  --_cluster-space: var(--space-2xs);
  z-index: 10;
}

.doc-awards {
  backdrop-filter: blur(40px);
  border-radius: 5px;
  padding: var(--space-3xs-2xs);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: var(--white-color);
  transition: background-color 0.3s ease, width 0.3s ease;

  &.active {
    background-color: var(--primary-color);
    width: 20px;
  }
}
</style>