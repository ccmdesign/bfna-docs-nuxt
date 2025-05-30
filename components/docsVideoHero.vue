<template>
  <div class="hero__video">
    <video class="hero__video-media" src="/assets/sample-2.mov" muted loop playsinline></video>
  </div>
</template>

<script setup>

</script>

<style scoped>
.hero__video {
  max-width: 100%;
  grid-column: full-start / full-end;
  z-index: 0;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  position: relative;
}

.hero__video-media {
  width: 100%;
  object-fit: cover;
}

.hero__video::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 25%, rgba(0, 0, 0, 1));
  pointer-events: none;
}

</style>