<template>
  <div v-if="!isPlaying" class="hero-headings | subgrid stack">
    <slot name="content">
      <div class="hero__category | font-size:-1" style="text-transform: uppercase;">{{ currentVideo.workstream }}</div>
      <h1 class="hero__title | font-size:5">{{ currentVideo.title }}</h1>
      <div class="hero__author | font-size:-1">By {{ currentVideo.by }}</div>
      <div class="hero__meta | cluster">
        <docs-meta white>{{ currentVideo.video_info.duration }}min</docs-meta>
        <docs-meta>{{ currentVideo.video_info.year }}</docs-meta>
        <div class="hero__tags">
          <docs-chip v-for="tag in currentVideo.tags" :key="tag" :tag="tag" />
        </div>
      </div>
      <p class="hero__description | font-size:-1">{{ currentVideo.description }}</p>

      <div class="hero__actions | cluster">
        <docs-button effect="pill" variant="primary" icon="play_arrow" @click="playVideo">Watch Now</docs-button>
        <docs-button v-if="route.params.slug" effect="pill" variant="secondary" icon-after="arrow_backward" @click="backHome(currentVideo)">Back to list</docs-button>
        <docs-button v-else effect="pill" variant="secondary" icon-after="arrow_forward" @click="moreInfo(currentVideo)">More Info</docs-button>
      </div>
      <div class="awards-mobile-only" v-if="isMobile">
        <docs-hero-extra id="hero-extra" />
      </div>
    </slot>
  </div>
</template>

<script setup>
import { useVideoStore } from '~/stores/video';
import { storeToRefs } from 'pinia';

const route = useRoute();
const videoStore = useVideoStore();
const { isPlaying, currentVideo } = storeToRefs(videoStore);

const playVideo = () => {
  videoStore.setIsPlaying(true);
}

const router = useRouter();
const moreInfo = (video) => {
  
  setTimeout(() => {
    router.push({
      name: `video-detail`,
      path: video.slug,
      params: { slug: video.slug }
    });
  }, 100);
}

const backHome = () => {
  router.push({ name: 'index' });
}

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

<style scoped lang="scss">

/* Hero Layout - SubGrid */

.hero-headings {
  grid-column: content-start / content-end;
  grid-row: 3 / 4;
  justify-self: end;
  padding-block-end: var(--space-3xl);

  @media (max-width: 768px) { padding-block-end: var(--space-m); }
  @media (min-width: 768px) { grid-column: content-start / col2; }

  --_stack-space: var(--space-2xs);

  .hero__actions {
    --_stack-space: var(--space-s);
    --_cluster-space: var(--space-s);
  }
}

.awards-mobile-only {
  margin: 10px 0;
  padding: 4px 0;
  background-color: var(--white-color-10-shade);
  border-radius: 10px;
}

</style>