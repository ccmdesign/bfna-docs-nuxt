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

<script setup>
import { useVideoStore } from '~/stores/video';
import { storeToRefs } from 'pinia';

const videoStore = useVideoStore();
const { homepageVideoEffect } = storeToRefs(videoStore);
const showVideoLoad = computed(() => homepageVideoEffect.value);

function getUIType() {
  if (import.meta.client) {
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
        ? videoStore.currentVideo.description 
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
