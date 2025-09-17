<template>
  <div v-if="!isPlaying" class="hero-headings | subgrid stack">
    <slot name="content">
      <docs-button v-if="route.name !== 'index'" class="back-btn" effect="pill" variant="secondary" icon="arrow_back_ios" @click="backHome"><span style="text-transform: uppercase;">Back</span></docs-button>
      <h1 class="hero__title | font-size:5">{{ currentVideo.title }}</h1>
      <div class="hero__author | font-size:-1">By {{ currentVideo.by }}</div>
      <div class="hero__meta | cluster">
        <docs-meta white>{{ currentVideo.video_info.duration }}min</docs-meta>
        <docs-meta>{{ currentVideo.video_info.year }}</docs-meta>
        <div class="hero__tags">
          <docs-chip v-for="tag in currentVideo.tags" :key="tag" :tag="tag" />
        </div>
      </div>
      <p
        :class="['font-size:-1', route.name === 'index' ? 'hero__description' : '']"
      >
        {{ currentVideo.description }}
      </p>

      <div class="hero__actions | cluster">
        <docs-button effect="pill" variant="primary" icon="play_arrow" @click="playVideo">Watch Now</docs-button>
        <docs-button v-if="route.params.slug && hasTrailer" class="trailer-btn" effect="pill" variant="secondary" icon="play_arrow" @click="handleWatchTrailer()">Watch Trailer</docs-button>
        <docs-button v-if="route.name === 'index'" effect="pill" variant="secondary" icon-after="arrow_forward" @click="moreInfo(currentVideo)">More Info</docs-button>
      </div>
      <div class="awards-mobile-only" v-if="isMobile && currentVideo.awards && currentVideo.awards.length">
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
  videoStore.setTrailer(false);
  videoStore.setIsPlaying(true);
}

const hasTrailer = computed(() => {
  return currentVideo.value.video_info.teaser_url ? 
  true : false;
});

const handleWatchTrailer = () => {
  videoStore.setTrailer(hasTrailer.value);
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

.hero__description {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 3;
}

.back-btn {
  width: 42px;
  height: 40px;
  gap: 1rem;
  background-color: var(--base-color-60-tint);
  padding-block: 0 0 !important;
  align-items: center;

  @media (max-width: 768px) { 
    width: 35px;
    height: 35px;
    align-items: center;
  }
}

.trailer-btn {
  background-color: var(--base-color-60-tint);
}

</style>