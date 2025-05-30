<template>
  <video class="hero__video subgrid" src="/assets/sample-video.webm" autoplay muted loop playsinline></video>
</template>

<script setup>

</script>

<style scoped>
.hero__video {
  max-width: 100%;
  grid-column: full-start / full-end;
  grid-row: 1 / 4;
  z-index: 0;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}
</style>