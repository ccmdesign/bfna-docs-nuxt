<template>
  <div class="homepage">
    <div class="homepage__video-load" :class="{ show: showVideoLoad }"></div>
    <HomepageUISmall v-if="getUIType() === 'small'" />
    <HomepageUILarge v-if="getUIType() === 'large'" />

    <input id="cookie-trigger" type="checkbox">
    <div class="floating-message">  
      <div class="wrapper">
        <div class="floating-message__content">  
          <p>We use cookies to ensure you get the best experience on our website. <a class="link" href="https://www.bfna.org/privacy-policy/">More information</a></p>
          <label for="cookie-trigger"><i class="material-icons">close</i></label>
        </div>
      </div>
    </div>
  </div>
</template>

<!--
<style lang="scss">
.homepage {
  position: relative;
  width: 100%;

  &__video-load {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: #000000;
    z-index: 1000;
    pointer-events: none;
    transition: opacity 0.33s ease-in-out, transform 0.33s ease-in-out;
    opacity: 0;
    transform: scale(0.875);

    &.show {
      pointer-events: all;
      opacity: 1;
      transform: none;
    }
  }
}

.material-icons {
  font-family: 'Material Icons';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-feature-settings: 'liga';
  -webkit-font-smoothing: antialiased;
}
</style>
-->

<script setup>
import utils from '~/composables/utils';
import { useVideoStore } from '~/stores/video';
import { storeToRefs } from 'pinia';
import HomepageUILarge from '~/components/HomepageUILarge.vue';
import HomepageUISmall from '~/components/HomepageUISmall.vue';

const videoStore = useVideoStore();
const { homepageVideoEffect } = storeToRefs(videoStore);

const showVideoLoad = computed(() => homepageVideoEffect.value);

function getUIType() {
  if (process.client) {
    return document.documentElement.clientWidth >= 768 ? 'large' : 'small';
  }
  return 'large'; // Default for server-side rendering
}

onMounted(() => {
  videoStore.setHomepageVideoEffect(false);
  videoStore.setNavigation(true);
});

useHead({
  title: 'BFNA Documentaries',
  meta: [
    {
      name: 'description',
      content: videoStore.hasVideos 
        ? videoStore.videoList[videoStore.currentVideo].description 
        : videoStore.emptyEpisode.description
    },
    {
      property: 'og:title',
      content: 'Bertelsmann Foundation Documentaries | Films for Transatlanticists'
    },
    {
      property: 'og:description',
      content: 'Our documentary films provide an intimate portrait of the economic, political, and social challenges facing the United States and Europe today.'
    }
  ]
});
</script>
