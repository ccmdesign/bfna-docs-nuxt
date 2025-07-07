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

function youtubeEmbedUrl(url) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]+)/)
  return match
    ? `https://www.youtube.com/embed/${match[1]}?rel=0&autoplay=1&mute=1&modestbranding=1`
    : ''
}

</script>

<template>
  <!-- <Youtube-Player 
    v-if="isPlaying && currentVideo.source === 'youtube'"
    class="hero__video"
    :video-id="currentVideo.videoId"
    :src="`${currentVideo.videoUrl}?autoplay=1&mute=1`"
    :autoplay="true"
    :mute="true"
    :rel="0"
    :controls="true"
    :modest-branding="false"
    :width="'100%'"
    :height="'100%'"
    allowfullscreen
    ref="youtube"
  ></Youtube-Player> -->

  <template v-if="isPlaying && currentVideo.source === 'youtube'">
    <iframe
      :key="showIframe + currentVideo.videoId"
      class="hero__video"
      :src="youtubeEmbedUrl(currentVideo.videoUrl)"
      frameborder="0"
      allow="autoplay; encrypted-media"
      allowfullscreen
    ></iframe>
  </template>
  
  <vimeoPlayer v-else-if="isPlaying && currentVideo.source === 'vimeo'" :vimeoUrl="currentVideo.videoUrl" class="hero__video" :controls="true" />
  
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
  // aspect-ratio: 16 / 9;
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

</style>