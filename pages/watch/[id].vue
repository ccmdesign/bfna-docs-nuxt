<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useVideoStore } from '~/stores/video';
import utils from '~/composables/utils';

definePageMeta({
  name: 'watch',
})

const videoId = ref('');
const source = ref('');
const videoObject = ref(null);
const show = ref(false);
const navigationVisible = ref(true);
const currentTimeout = ref(null);

const route = useRoute();
const router = useRouter();
const store = useVideoStore();

const youtube = useTemplateRef(null);
const player = ref(null);
const backButton = ref(null);

const videoList = computed(() => store.videoList);
const currentVideo = computed(() => store.currentVideo);

function showPlayer() {
  show.value = true;
  timeoutNavigation();
}

function timeoutNavigation() {
  if (!show.value) return;
  navigationVisible.value = true;
  if (currentTimeout.value) {
    clearTimeout(currentTimeout.value);
    currentTimeout.value = null;
  }
  currentTimeout.value = setTimeout(() => {
    navigationVisible.value = false;
    currentTimeout.value = null;
  }, 5000);
}

function keepNavigation() {
  navigationVisible.value = true;
  if (currentTimeout.value) {
    clearTimeout(currentTimeout.value);
    currentTimeout.value = null;
  }
}

function endVideo() {
  show.value = false;
  keepNavigation();
}

function holdLoading(cb) {
  if (videoList.value.length === 0) {
    setTimeout(() => holdLoading(cb), 300);
  } else {
    cb();
  }
}

onMounted(() => {
  const paramVideoId = route.params.videoId;
  holdLoading(() => {
    if (paramVideoId) {
      const matchedVideo = videoList.value.find(
        (video) => {
          return video.source == 'youtube'
            ? utils.getVideoIdFromYoutubeUrl(video.videoUrl) === paramVideoId
            : utils.getVideoIdFromVimeoUrl(video.videoUrl) === paramVideoId;
        }
      );
      let trailerVideo;
      let trailerVideoId;
      const current = currentVideo.value;
      if (current && current.video_info) {
        if (current.video_info.teaser_url) {
          trailerVideoId =
            current.video_info.teaser_source == 'youtube'
              ? utils.getVideoIdFromYoutubeUrl(current.video_info.teaser_url)
              : utils.getVideoIdFromVimeoUrl(current.video_info.teaser_url);
        }
        if (paramVideoId == trailerVideoId) {
          trailerVideo = current.video_info;
        }
      }
      if (matchedVideo) {
        videoObject.value = matchedVideo;
        videoId.value = paramVideoId;
        source.value = matchedVideo.source;
      } else if (trailerVideo) {
        videoObject.value = trailerVideo;
        videoId.value = trailerVideoId;
        source.value = trailerVideo.teaser_source;
      } else {
        router.replace('/');
        return;
      }
    } else {
      const current = currentVideo.value;
      if (current) {
        const id =
          current.source == 'youtube'
            ? utils.getVideoIdFromYoutubeUrl(current.videoUrl)
            : utils.getVideoIdFromVimeoUrl(current.videoUrl);
        if (id) {
          videoObject.value = current;
          videoId.value = id;
          source.value = current.source;
        } else {
          alert(
            `Couldn't play video:\nvideo ID not found in "${current.videoUrl}".`
          );
          return;
        }
      } else {
        alert(`Couldn't play video:\nvideo object not found.`);
        return;
      }
      if (!videoId.value) {
        alert(
          `Couldn't play video:\nvideo ID not found in "${current.videoUrl}".`
        );
        return;
      }
    }
    store.setHomepageVideoEffect(true);
    store.setNavigation(false);
    setTimeout(() => {
      if (source.value == 'youtube') {
        // youtube.value.player.playVideo();
        // setTimeout(() => {
        //   youtube.value.player.getPlayerState().then((status) => {
        //     if (status !== 1) {
        //       show.value = true;
        //     }
        //   });
        // }, 1000);

        
      } else {
        console.log(34, player.value)
        // player.value.play();
      }
    }, 1000);
  });
});

// metaInfo equivalent for Nuxt 2/3
useHead && useHead(computed(() => ({
  title: videoObject.value
    ? `${videoObject.value.title} on BFNA Documentaries`
    : 'Watch | BFNA Documentaries',
  meta: [
    {
      vmid: 'description',
      name: 'description',
      content:
        videoObject.value && videoObject.value.description
          ? videoObject.value.description
          : utils.getDefaultDescription(),
    },
    {
      vmid: 'keywords',
      name: 'keywords',
      content:
        videoObject.value &&
        videoObject.value.tags &&
        videoObject.value.tags.length > 0
          ? videoObject.value.tags.join(',')
          : '',
    },
    {
      vmid: 'og:title',
      property: 'og:title',
      content: videoObject.value
        ? `${videoObject.value.title} on BFNA Documentaries`
        : 'Watch | BFNA Documentaries',
    },
    {
      vmid: 'og:description',
      property: 'og:description',
      content:
        videoObject.value && videoObject.value.description
          ? videoObject.value.description
          : utils.getDefaultDescription(),
    },
  ],
})));
</script>

<template>
  <div
    class="watch-view"
    @mousemove="timeoutNavigation"
    @click="timeoutNavigation"
    @mouseover="timeoutNavigation"
  >
    <NuxtLink
      ref="backButton"
      to="/"
      class="watch-view__back material-symbols-outlined"
      :class="{ visible: navigationVisible }"
      @mousemove="timeoutNavigation"
      @click="timeoutNavigation"
      @mouseover="timeoutNavigation"
      >close</NuxtLink
    >
    <div
      class="watch-view__wrapper"
      :class="{ show }"
      @mousemove="timeoutNavigation"
      @click="timeoutNavigation"
      @mouseover="timeoutNavigation"
    >

      <Youtube-Player 
        v-if="source=='youtube'"
        class="watch-view__player"
        :video-id="videoId"
        :src="`${videoObject.videoUrl}?autoplay=1&mute=1`"
        mute
        playsinline
        :width="'100%'"
        :height="'100%'"
        allowfullscreen
        ref="youtube"
        @playing="showPlayer"
        @mousemove="timeoutNavigation"
        @click="timeoutNavigation"
        @mouseover="timeoutNavigation"
        @paused="keepNavigation"
        @ended="endVideo"
      ></Youtube-Player>
      <Vimeo-Player
        v-if="source=='vimeo'"
        class="watch-view__player"
        :video-id="videoId"
        :autoplay="true"
        playsinline
        allowfullscreen
        ref="player"
        @playing="showPlayer"
        @mousemove="timeoutNavigation"
        @click="timeoutNavigation"
        @mouseover="timeoutNavigation"
        @paused="keepNavigation"
        @ended="endVideo"
      ></Vimeo-Player>
    </div>
  </div>
</template>

<style lang="scss">
.watch-view {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-color: #000000;
  overflow: hidden;

  &__panel-wrapper {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }

  &__panel {
    opacity: 0;
    width: 960px;
    max-width: 100%;
    margin: 0 32px;
    padding: 64px 0;
    overflow: auto;
    transition: opacity 0.13s ease-in-out;

    &.visible {
      @include media-breakpoint-large {
        opacity: 1;
        pointer-events: all;
      }
    }
  }

  &__subscribe {
    background-color: rgba(0, 0, 0, 0.93);
    padding: 24px 48px 36px 48px;
    display: flex;
    flex-direction: column;

    @include media-breakpoint-large {
      flex-direction: row;
    }

    #mergeRow-gdpr,
    #mergeRow-interests {
      display: none;
    }

    p {
      font-size: 1.25em;
      font-weight: 300;
    }

    &-email {
      flex: 1;
      background: none;
      border: 1px solid rgba(255, 255, 255, 0.5);
      padding: 10px 20px;
      font-size: 1.15em;
      color: #ffffff;
      font-weight: lighter;

      &:active {
        border-color: #ffffff;
        background-color: #ffffff;
        text-decoration: none;
        color: #000000;
      }
    }

    &-submit {
      flex: 0;
      background: none;
      border: 1px solid rgba(255, 255, 255, 0.5);
      border-left: none;
      text-align: center;
      padding: 10px 20px;
      font-size: 1.15em;
      color: #ffffff;
      letter-spacing: 1px;
      text-transform: uppercase;
      cursor: pointer;

      &:hover {
        border-color: #ffffff;
        background-color: #ffffff;
        text-decoration: none;
        color: #000000;
      }

      &:disabled {
        opacity: 0.33;
        pointer-events: none;
      }
    }

    &-channel {
      flex: 1;

      @include media-breakpoint-large {
        margin-left: 48px;
      }

      a {
        display: block;
        border: 1px solid rgba(255, 255, 255, 0.5);
        text-align: center;
        padding: 10px 20px;
        text-transform: uppercase;
        font-size: 1.15em;
        color: #ffffff;
        letter-spacing: 1px;

        &:hover {
          border-color: #ffffff;
          background-color: #ffffff;
          text-decoration: none;
          color: #000000;
        }
      }
    }
  }

  &__suggested-tweet {
    background-color: rgba(#fc8b00, 0.97);
    padding: 32px 64px 0 64px;
    margin: 0 0 64px 0;

    p {
      font-size: 1.5em;
      line-height: 30px;
      font-weight: 300;
    }
  }

  &__tweet-this {
    &-wrapper {
      text-align: center;
      transform: translateY(50%);

      @include media-breakpoint-small {
        transform: none;
        padding: 16px 0 32px 0;
      }
    }

    display: inline-flex;
    align-items: center;
    justify-content: center;
    background-color: #007dad;
    padding: 10px 20px;
    color: #ffffff;
    text-transform: uppercase;
    letter-spacing: 0.33px;

    @include media-breakpoint-small {
      display: block;
    }

    &:hover {
      text-decoration: none;
      background-color: lighten(#007dad, 7);
      color: #ffffff;
    }
  }

  &__wrapper {
    width: 100%;
    height: 100%;
  }

  &__back {
    @extend .material-icons !optional;
    position: absolute;
    bottom: 48px;
    right: 48px;
    background-color: rgb(8, 67, 94);
    font-size: 2em;
    padding: 12px;
    box-shadow: 4px 4px 16px rgba(0, 0, 0, 0.25);
    cursor: pointer;
    opacity: 0;
    // pointer-events: none;
    transition: background-color 0.23s ease-in-out, opacity 0.13s ease-in-out;
    z-index: 100;

    @include media-breakpoint-large {
      bottom: initial;
      top: 48px !important;
    }

    &:hover {
      background-color: #000000;
    }

    &.visible {
      pointer-events: all;
      opacity: 1;
    }
  }

  &__player {
    width: 100%;
    height: 100%;
    // z-index: -1;
    iFrame { 
      width: 100%;
      height: 100%;
    }
  }

  &__back {
    text-decoration: none;
    color: #ffffff;
  }
}
</style>

