<template>
  <div class="card">
    <slot name="content">
      <div class="stack">
        <h2><nuxt-link to="/detail-page">Card Title</nuxt-link></h2>
        <p>Card Description</p>
      </div>
    </slot>
    <video 
      class="card__video" 
      src="/assets/sample-3.mov" 
      muted 
      loop 
      playsinline 
      preload="auto"
    ></video>
  </div>
</template>

<script setup>


</script>

<style scoped>

/* Docs Card Layout - SubGrid */


.card {
  padding: 1rem;
  border-radius: var(--border-radius-m);
  overflow: hidden;
  aspect-ratio: 16 / 9;
  position: relative;
}

.card__video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
}
</style>
