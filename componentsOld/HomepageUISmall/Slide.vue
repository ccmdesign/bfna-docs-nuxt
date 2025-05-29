<template>
  <slide class="homepage__slider__slide" @slideclick="openVideo(video)">
    <background :imageUrl="video.backgroundImage" />
  </slide>
</template>

<style lang="scss">
.homepage__slider__slide {
  width: 100%;
  height: 100vh;
}
</style>

<script setup>
import { useRouter } from 'vue-router';
import utils from '~/composables/utils';

const props = defineProps({
  id: String,
  url: String,
  title: String,
  subtitle: String
});

const router = useRouter();

function watchVideo() {
  const videoId = utils.getVideoIdFromYoutubeUrl(props.url);
  router.push({ name: 'watch-videoId', params: { videoId } });
}
</script>
