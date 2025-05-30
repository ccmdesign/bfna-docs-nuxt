<template>
  <div class="card">
    <video 
      class="card__video" 
      src="/assets/sample-3.mov" 
      muted 
      loop 
      playsinline 
      preload="auto"
    ></video>
    <slot name="content">
      <div class="card__content | stack">
        <h2 class="card__title"><nuxt-link to="/detail-page">Card Title</nuxt-link></h2>
        <div class="card__meta | cluster">
          <span>28min</span>
          <span>2023</span>
        </div>
      </div>
    </slot>
  </div>
</template>

<script setup>


</script>

<style scoped>

/* Docs Card Layout - SubGrid */


.card {
  margin-block-start: var(--space-s);
}

.card__content {
  --_stack-space: var(--space-3xs);
  padding-block-start: var(--space-2xs);
}

.card__video {
  aspect-ratio: 16 / 9;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--border-radius-m);
  overflow: hidden;
}

.card__title a {
  font-size: var(--size-0);
  font-weight: 600;
  letter-spacing: 0.04em;
  margin: 0;
  text-decoration: none;
  color: var(--white-color);
}

.card__meta {
  font-size: var(--size--2);
  font-weight: 400;
  letter-spacing: 0.04em;
  color: var(--white-color-60-shade);
  
  > * { 
    display: inline-block;
    line-height: 1;
    padding: var(--space-3xs) var(--space-2xs);
    background-color: var(--white-color-10-shade); 
  } 
}



.card {
  display: grid;
  grid-template-columns: 1fr;

  @media (max-width: 320px) { grid-column: content-start / content-end; }
  @media (min-width: 321px) and (max-width: 768px) { grid-column: span 2; }
}
</style>
