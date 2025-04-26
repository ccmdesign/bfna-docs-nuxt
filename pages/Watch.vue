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
      class="watch-view__back"
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
      <youtube 
        v-if="this.source=='youtube'"
        class="watch-view__player"
        :video-id="videoId"
        :autoplay="true"
        playsinline
        allowfullscreen
        ref="youtube"
        @playing="showPlayer"
        @mousemove="timeoutNavigation"
        @click="timeoutNavigation"
        @mouseover="timeoutNavigation"
        @paused="keepNavigation"
        @ended="endVideo"
      ></youtube>
      <vimeo-player
        v-if="this.source=='vimeo'"
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
      ></vimeo-player>

    </div>
  </div>
</template>

<!--
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
    z-index: -1;
    iFrame { 
      width: 100%;
      height: 100%;
    }
  }
}
</style>
-->

<script>
import utils from "~/composables/utils";

export default {
  data() {
    return {
      videoId: "",
      source: '',
      videoObject: null,
      show: false,
      navigationVisible: true,
      currentTimeout: null,
    };
  },
  computed: {
    videoList() {
      return this.$store.state.videoList;
    },
    currentVideo() {
      return this.$store.state.currentVideo;
    },
  },
  methods: {
    showPlayer() {
      this.show = true;
      this.timeoutNavigation();
    },
    timeoutNavigation() {
      if (!this.show) return;
      this.navigationVisible = true;
      if (this.currentTimeout) {
        clearTimeout(this.currentTimeout);
        this.currentTimeout = null;
      }
      this.currentTimeout = setTimeout(() => {
        this.navigationVisible = false;
        this.currentTimeout = null;
      }, 5000);
    },
    keepNavigation() {
      this.navigationVisible = true;
      if (this.currentTimeout) {
        clearTimeout(this.currentTimeout);
        this.currentTimeout = null;
      }
    },
    endVideo() {
      this.show = false;
      this.keepNavigation();
    },
    holdLoading(cb) {
      if (this.videoList.length === 0) {
        setTimeout(() => this.holdLoading(cb), 300);
      } else {
        cb();
      }
    },
  },
  mounted() {
    const paramVideoId = this.$route.params.videoId;
    this.holdLoading(() => {
      if (paramVideoId) {
        const matchedVideo = this.videoList.find(
          (video) => {
            return video.source == 'youtube' ? utils.getVideoIdFromYoutubeUrl(video.videoUrl) === paramVideoId : utils.getVideoIdFromVimeoUrl(video.videoUrl) === paramVideoId
            }
        );
        let trailerVideo
        let trailerVideoId
        const currentVideo = this.videoList[this.currentVideo];
        if(currentVideo.video_info) {
          console.log(currentVideo.video_info)
          if(currentVideo.video_info.teaser_url){
            trailerVideoId = currentVideo.video_info.teaser_source == 'youtube' ? utils.getVideoIdFromYoutubeUrl(currentVideo.video_info.teaser_url) : utils.getVideoIdFromVimeoUrl(currentVideo.video_info.teaser_url)
          }
          if(paramVideoId == trailerVideoId) {
            trailerVideo = currentVideo.video_info
          }
        }
        if (matchedVideo) {
          this.videoObject = matchedVideo;
          this.videoId = paramVideoId;
          this.source = matchedVideo.source;
        } else if (trailerVideo) { 
          this.videoObject = trailerVideo;
          this.videoId = trailerVideoId;
          this.source = trailerVideo.teaser_source;
        } else {
          this.$router.replace("/");
          return;
        }
      } else {
        const currentVideo = this.videoList[this.currentVideo];
        if (currentVideo) {
          const videoId = currentVideo.source == 'youtube' ? utils.getVideoIdFromYoutubeUrl(currentVideo.videoUrl) : utils.getVideoIdFromVimeoUrl(currentVideo.videoUrl);
          if (videoId) {
            this.videoObject = currentVideo;
            this.videoId = videoId;
            this.source = currentVideo.source;
          } else {
            alert(
              `Couldn't play video:\nvideo ID not found in "${currentVideo.videoUrl}".`
            );
            return;
          }
        } else {
          alert(`Couldn't play video:\nvideo object not found.`);
          return;
        }
        if (!this.videoId) {
          alert(
            `Couldn't play video:\nvideo ID not found in "${currentVideo.videoUrl}".`
          );
          return;
        }
      }
      this.$store.commit("setHomepageVideoEffect", true);
      this.$store.commit("setNavigation", false);
      setTimeout(() => {
        if(this.source == 'youtube') {
          this.$refs.youtube.player.playVideo();
          setTimeout(() => {
            this.$refs.youtube.player.getPlayerState().then((status) => {
              if (status !== 1) {
                this.show = true;
              }
            });
          }, 1000);
        } else {
          this.$refs.player.play();
        }
      }, 1000);
    });
  },
  metaInfo() {
    return {
      title: this.videoObject
        ? `${this.videoObject.title} on BFNA Documentaries`
        : "Watch | BFNA Documentaries",
      meta: [
        {
          vmid: "description",
          name: "description",
          content:
            this.videoObject && this.videoObject.description
              ? this.videoObject.description
              : utils.getDefaultDescription(),
        },
        {
          vmid: "keywords",
          name: "keywords",
          content:
            this.videoObject &&
            this.videoObject.tags &&
            this.videoObject.tags.length > 0
              ? this.videoObject.tags.join(",")
              : "",
        },
        {
          vmid: "og:title",
          property: "og:title",
          content: this.videoObject
            ? `${this.videoObject.title} on BFNA Documentaries`
            : "Watch | BFNA Documentaries",
        },
        {
          vmid: "og:description",
          property: "og:description",
          content:
            this.videoObject && this.videoObject.description
              ? this.videoObject.description
              : utils.getDefaultDescription(),
        },
      ],
    };
  },
};
</script>
