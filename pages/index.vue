<template>
  <div class="homepage">
    <div class="homepage__video-load" :class="{ show: showVideoLoad }"></div>
    <ui-small v-if="getUIType() === 'small'" />
    <ui-large v-if="getUIType() === 'large'" />

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
</style>

<script>
import utils from '../utils';

export default {
  name: 'home',
  components: {
    'ui-large': () => import('@/components/HomepageUILarge.vue'),
    'ui-small': () => import('@/components/HomepageUISmall.vue'),
  },
  computed: {
    showVideoLoad () {
      return this.$store.state.homepageVideoEffect;
    },
  },
  methods: {
    getUIType () {
      return document.documentElement.clientWidth >= 768 ? 'large' : 'small'
    },
  },
  mounted () {
    this.$store.commit('setHomepageVideoEffect', false)
    this.$store.commit('setNavigation', true)
  },
  metaInfo () {
    return {
      title: 'BFNA Documentaries',
      meta: [
        {
          vmid: 'description',
          name: 'description',
          content: (this.$store.getters.hasVideos ? this.$store.state.videoList[this.$store.state.currentVideo] : this.$store.getters.emptyEpisode).description
        },
        {
          vmid: 'og:title',
          property: 'og:title',
          content: 'Bertelsmann Foundation Documentaries | Films for Transatlanticists'
        },
        {
          vmid: 'og:description',
          property: 'og:description',
          content: 'Our documentary films provide an intimate portrait of the economic, political, and social challenges facing the United States and Europe today.'
        }
      ]
    }
  }
}
</script>
