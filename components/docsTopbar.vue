<template>
  <div v-if="!isPlaying" class="docs-topbar | subgrid cluster" :style="{ justifyContent: isMobile ? 'space-between' : 'flex-start' }">
      <h1 class="docs-topbar__left"><nuxt-link to="/">
        <img src="/assets/bfna-documentaries-logo.png" alt="BFNA Documentaries" />
      </nuxt-link>
    </h1>
    
    <span v-if="isMobile && route.path !== '/search'" class="material-symbols-outlined" @click="() => navigateTo('/search')">search</span>
    <docs-search v-else class="docs-topbar__center" split-left split-right />
    
    <a class="docs-topbar__right | hide-on-mobile" href="#">Visit Bertelsmann Foundation <span class="icon">open_in_new</span></a>
  </div>
</template>

<script setup>
import { useVideoStore } from '~/stores/video';
import { storeToRefs } from 'pinia';

const videoStore = useVideoStore();
const { isPlaying } = storeToRefs(videoStore);

const route = useRoute();
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

<style scoped>
.docs-topbar {
  grid-column: content-start / content-end;
  align-items: start;
  grid-row: 1 / 2;
  z-index: 1;
  padding-block-start: var(--space-s);
}

.docs-topbar__left img {
  max-width: 180px;
}

.docs-topbar__center {
  max-width: 380px;
}

.docs-topbar__right {
  display: flex;
  align-items: center;
  gap: var(--space-3xs);
  text-align: right;
  color: var(--white-color);
  font-size: var(--size--1);
  font-weight: 400;
  letter-spacing: 0.04em;
  text-decoration: none;

  .icon {
    line-height: .7;
    font-size: var(--size-0);
  }
}
</style>
