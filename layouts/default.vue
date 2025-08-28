<script setup>
const isMobile = ref(false);
function checkMobile() {
  isMobile.value = window.innerWidth <= 768;
}

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});

</script>

<template>
  <master-grid>
    <docs-topbar id="topbar" />
    <docs-hero-video id="hero-video" />
    <docs-hero-headings id="hero" />
    <docs-hero-extra id="hero-extra" v-if="!isMobile" />

    <slot />

    <docs-footer id="footer" />
  </master-grid>
</template>

<style>
#hero-video {
  grid-row: 1 / 4;
  z-index: 0;
}

#hero-extra {
  grid-column: 10/14;
  grid-row: 3 / 4;
  z-index: 1;
  align-self: center;
}

#hero {
  grid-row: 3 / 4;
  z-index: 1;
}

#featured-reel {
  z-index: 1;
}

#footer {
  grid-row: 9 / 10;
  z-index: 1;
}
</style> 