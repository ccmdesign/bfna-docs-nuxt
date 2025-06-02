<template>
  <div class="doc-awards">
    <img class="doc-awards__flag" src="/assets/award-ribbon.svg" alt="Award Ribbon" />
    <h4 class="doc-awards__title">{{ currentAward.title }}</h4>
    <div class="cluster doc-awards__meta">
      <docs-meta>{{ currentAward.year }}</docs-meta>
      <docs-meta>{{ currentAward.festival }}</docs-meta>
    </div>
    <span class="doc-awards__counter">{{ current+1 }}/{{ total }}</span>

    <div class="dot-container | cluster">
      <div
        v-for="(a, i) in awards"
        :key="i"
        class="dot"
        :class="{ active: i === current }"
        @click="current = i"
      ></div>
    </div>

    <div class="doc-awards__controls">
      <docs-button icon="arrow_back_ios" size="s" @click="prev" />
      <docs-button icon="arrow_forward_ios" size="s" @click="next" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const awards = [
  {
    year: '2021',
    festival: 'DC Shorts International Film Festival',
    title: 'Official Selection',
  },
  {
    year: '2022',
    festival: 'Another Festival',
    title: 'Best Documentary',
  },
  {
    year: '2023',
    festival: 'Yet Another Festival',
    title: 'Audience Choice',
  },
]

const current = ref(0)
const total = awards.length

const currentAward = computed(() => awards[current.value])

function prev() {
  current.value = (current.value - 1 + total) % total
}
function next() {
  current.value = (current.value + 1) % total
}
</script>

<style lang="scss" scoped>
.doc-awards {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto auto auto;
  gap: var(--space-3xs-2xs);
  grid-template-areas:
    "flag title title"
    "flag meta meta"
    "n counter controls";
}

.doc-awards__flag {
  grid-area: flag;
  aspect-ratio: 1/1;
  width: 32px;
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
  border-radius: var(--radius-l);
  padding: var(--space-s-m);
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