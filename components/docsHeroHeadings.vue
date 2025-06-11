<template>
  <div class="hero-headings | subgrid stack">
    <slot name="content">
      <div class="hero__category | font-size:-1">{{ currentVideo.workstream }}</div>
      <h1 class="hero__title | font-size:5">{{ currentVideo.title }}</h1>
      <div class="hero__author | font-size:-1">By {{ currentVideo.by }}</div>
      <div class="hero__meta | cluster">
        <docs-meta>{{ currentVideo.video_info.duration }}min</docs-meta>
        <docs-meta>{{ currentVideo.video_info.year }}</docs-meta>
      </div>
      <p class="hero__description | font-size:-1">{{ currentVideo.description }}</p>

      <div class="hero__actions | cluster">
        <docs-button effect="pill" variant="primary" icon="play_arrow">Watch Now</docs-button>
        <docs-button effect="pill" variant="secondary" icon-after="arrow_forward">More Info</docs-button>
      </div>
    </slot>
  </div>
</template>

<script setup>
import { useVideoStore } from '~/stores/video';

const { currentVideo } = useVideoStore();

</script>

<style scoped>

/* Hero Layout - SubGrid */

.hero-headings {
  grid-column: content-start / content-end;
  grid-row: 3 / 4;
  justify-self: end;
  padding-block-end: var(--space-3xl);
  @media (min-width: 768px) { grid-column: content-start / col2; }

  --_stack-space: var(--space-2xs);

  .hero__actions {
    --_stack-space: var(--space-s);
    --_cluster-space: var(--space-s);
  }
}

</style>