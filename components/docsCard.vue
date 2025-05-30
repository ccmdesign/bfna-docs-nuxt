<template>
  <div class="card" :thumbnail="thumbnail">
    <video 
      class="card__video" 
      src="/assets/sample-3.mov" 
      muted 
      loop 
      playsinline 
      preload="auto"
    ></video>
    <slot name="content" v-if="!thumbnail">
      <div class="card__content | stack">
        <h2 class="card__title"><nuxt-link to="/detail-page">Card Title</nuxt-link></h2>
        <div class="card__meta | cluster">
          <docs-meta>28min</docs-meta>
          <docs-meta>2023</docs-meta>
        </div>
      </div>
    </slot>
  </div>
</template>

<script setup>
const props = defineProps({
  thumbnail: {
    type: Boolean,
    default: false
  }
})

</script>

<style scoped>

/* Docs Card Layout - SubGrid */

.card {
  width: 100%;
}

.card__content {
  --_stack-space: var(--space-3xs);
}

.card__video {
  width: 100%;
  object-fit: cover;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: var(--border-radius-m);

  [thumbnail="true"] & {
    border-radius: var(--border-radius-s);
  }
}

.card__title a {
  font-size: var(--size-0);
  font-weight: 600;
  letter-spacing: 0.04em;
  margin: 0;
  text-decoration: none;
  color: var(--white-color);
}

.card {
  transition: all 0.3s ease-in-out;
  gap: var(--space-3xs-2xs);
  
  @media (max-width: 320px) { 
    grid-column: content-start / content-end; 
  }
  @media (min-width: 321px) and (max-width: 768px) { grid-column: span 6; }

  @media (min-width: 769px) {
    grid-column: span 3;

    /* TODO: Add hover effect with transition */
    /* &:hover {
      grid-column: span 4;
    } */
  }
}
</style>
