<script setup>
import { useVideoStore } from '~/stores/video';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import { watch } from 'vue';

const videoStore = useVideoStore();
const { isPlaying, currentVideo } = storeToRefs(videoStore);
const { setIsPlaying } = videoStore;
const route = useRoute();

watch(
  [() => currentVideo.value, () => route.fullPath],
  () => {
    setIsPlaying(false);
  },
  { immediate: true }
);

const youtubeEmbedUrl = (url) => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]+)/)
  return match
    ? `https://www.youtube.com/embed/${match[1]}?rel=0&autoplay=1&modestbranding=1`
    : ''
}

const vimeoEmbedUrl = (url) => {
  const match = url.match(/vimeo\.com\/(\d+)/)
  return match ? `https://player.vimeo.com/video/${match[1]}?autoplay=1&background=0` : ''
}

const isHomeBtnVisible = ref(true);
const isMobile = () => window.matchMedia('(pointer: coarse)').matches;
const handleHeroTap = () => {
  isHomeBtnVisible.value = !isHomeBtnVisible.value;
};

onMounted(() => {
  if (isMobile()) {
    isHomeBtnVisible.value = false;
    const hero = document.querySelector('.hero__video');
    if (hero) {
      hero.addEventListener('touchend', handleHeroTap);
    }
  }
});

onBeforeUnmount(() => {
  if (isMobile()) {
    isHomeBtnVisible.value = true;
    const hero = document.querySelector('.hero__video');
    if (hero) {
      hero.removeEventListener('touchend', handleHeroTap);
    }
  }
});

</script>


<template>
    <template v-if="isPlaying && currentVideo.source === 'youtube'">
      <docsHomeButton v-if="isPlaying && isHomeBtnVisible" />
      <iframe
        ref="youtubeIframeRef"
        :key="currentVideo.videoId"
        class="hero__video"
        :class="isPlaying ? 'hero__video-playing' : ''"
        :src="youtubeEmbedUrl(currentVideo.videoUrl)"
        frameborder="0"
        allow="autoplay; encrypted-media"
        allowfullscreen
      ></iframe>
    </template>

    <!-- <vimeoPlayer v-else-if="isPlaying && currentVideo.source === 'vimeo'"
      :vimeoUrl="currentVideo.videoUrl" 
      class="hero__video"
      :class="isPlaying ? 'hero__video-playing' : ''" 
      :controls="true" /> -->

    <template v-else-if="isPlaying && currentVideo.source === 'vimeo'">
      <docsHomeButton v-if="isPlaying && isHomeBtnVisible" />
      <iframe
        :key="currentVideo.videoUrl"
        class="hero__video"
        :class="isPlaying ? 'hero__video-playing' : ''"
        :src="vimeoEmbedUrl(currentVideo.videoUrl)"
        frameborder="0"
        allow="autoplay; fullscreen"
        allowfullscreen
      ></iframe>
    </template>

    <div v-else class="hero__video">
      <!-- <video class="hero__video-media" src="/assets/sample-3.mov" muted loop playsinline></video> -->
      <div class="hero__video-media" :style="{ backgroundImage: `url('${currentVideo.backgroundImage}')`, height: '100%' }"></div>
    </div>
</template>

<style scoped lang="scss">
.hero__video {
  max-width: 100%;
  grid-column: full-start / full-end;
  z-index: 0;
  aspect-ratio: 17 / 8;
  object-fit: cover;
  position: relative;
  opacity: 0.5;
}

.hero__video-media {
  width: 100%;
  object-fit: cover;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
}

.hero__video::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 25%, rgba(0, 0, 0, 1));
  pointer-events: none;
}

.hero__video-playing {
  opacity: 1;
}

.hero__video-playing::after {
  display: none;
}

</style>