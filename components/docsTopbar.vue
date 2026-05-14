<template>
  <div v-if="!isPlaying" class="docs-topbar | subgrid cluster" :isHomepage="isHomepage" :style="{ justifyContent: isMobile ? 'space-between' : 'flex-start', '--logo-scale': logoScale }">
      <h1 class="docs-topbar__left | site-logo">
      <nuxt-link to="/" aria-label="BFNA Documentaries home" @click.prevent="handleGoHome">
        <img src="/assets/bfna-documentaries-logo.png" alt="BFNA Documentaries" />
      </nuxt-link>
    </h1>
    <div class="docs-topbar__center">
      <span v-if="isMobile && route.path !== '/search'" class="material-symbols-outlined" @click="() => navigateTo('/search')">search</span>
      <docs-search v-else split-left split-right />
    </div>
    
    
    <a class="docs-topbar__right | hide-on-mobile" href="https://www.bfna.org/" target="_blank" rel="noopener">Visit Bertelsmann Foundation <span class="icon" aria-hidden="true">open_in_new</span></a>
  </div>
</template>

<script setup>
import { useVideoStore } from '~/stores/video';
import { storeToRefs } from 'pinia';

const videoStore = useVideoStore();
const { isPlaying } = storeToRefs(videoStore);

const route = useRoute();
const isMobile = ref(false);
const scrollY = ref(0);

const isHomepage = computed(() => route.path === '/');

function checkMobile() {
  isMobile.value = window.innerWidth <= 768;
}

const logoScale = computed(() => {
  if (!isHomepage.value) return 1;
  const scroll = scrollY.value;
  return 1.25 - (scroll / 100) * 1.25;
});

function handleScroll() {
  scrollY.value = window.scrollY;
}

const handleGoHome = () => {
  videoStore.resetToHome();
  navigateTo('/');
};

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Initialize scroll value
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
  window.removeEventListener('scroll', handleScroll);
});

</script>

<style scoped>
.docs-topbar {
  grid-column: content-start / content-end;
  align-items: start;
  grid-row: 1 / 2;
  z-index: 1;
  padding-block-start: var(--space-s);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

}

.docs-topbar__left { flex: 1; }
.docs-topbar__center { 
  flex: 1; 
}

@media (max-width: 768px) {
  .docs-topbar__center {
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
  }
}

.docs-topbar__right { 
  flex: 1; 
  justify-content: flex-end;
}

.docs-topbar__left img {
  max-width: calc(180px * var(--logo-scale));
}

.docs-topbar__center > * {
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

.site-logo img {
  width: 80%;
}
</style>
