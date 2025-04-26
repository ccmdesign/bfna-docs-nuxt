<template>
  <div class="homepage">
    <div
      class="homepage__slider__background--large"
      :style="`background-image: url('${currentVideo.backgroundImage}')`"
    ></div>
    <VideoDescription open="false" @eventname="hideList" />
    <navigation-bar />
    <menu-ui />
    <div class="homepage__list-bar" :class="{ animated : animate }">
      <!--<div class="homepage__list-bar__section button-section">
        <div
          class="homepage__list-bar__button"
          :class="{ opened: videoListMenu }"
          :data-text="getButtonText()"
          @click="toggleVideoList"
        >
        </div>
        <div class="homepage__list-bar__by">
          by
          <a href="https://www.ccmdesign.ca" target="_blank" rel="noopener"
            >ccm.design</a
          >
        </div>
      </div>-->

      <div
        class="homepage__list-bar__section videos-section"
      >
        <video-list
          class="child"
          ref="videoListWrapper"
          :closeAction="closeVideoList"
        />
      </div>
    </div>
    <Footer />
  </div>
</template>

<style lang="scss" scoped>
.homepage {
  position: relative;
  width: 100%;
  height: 100vh;

  &__slider {
    width: 100%;
    height: 100vh;
  }

  &__list-bar {
    width: 100%;
    z-index: 100;
    opacity: 0;
    transition: opacity 0.5s ease-in-out;
    &.animated {
      opacity: 1;
    }
    &.opened {
      background-color: #01121ad9;
    }

    &__section {
      display: block;
      width: 100%;

      &.button-section {
        position: relative;
        text-align: center;
        height: 60px;
      }

      &.videos-section {
        overflow-y: hidden;
        transition: max-height 0.33s ease-in-out;

        &.closed {
          max-height: 0 !important;

          .child {
            opacity: 0;
          }
        }

        .child {
          opacity: 1;
          transition: opacity 0.33s ease-in-out;
        }
      }
    }

    &__button {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      display: inline-block;
      padding: 12px;
      cursor: pointer;
      transition: all 0.33s ease-in-out;
      &:before {
        content: attr(data-text);
        font-size: 1.5rem;
        font-weight: bold;
        text-transform: uppercase;
      }
      &.opened {
        transform: translate(-50%, -50%) rotateZ(179deg) scale(1.2);
        &:before {
          @extend .material-icons;
          width: 24px;
        }
      }
    }

    &__by {
      position: absolute;
      top: 50%;
      right: 16px;
      transform: translateY(-50%);
      font-size: 0.75em;
      opacity: 0.33;
      color: rgba(255, 255, 255, 0.33);

      a:hover {
        text-decoration: none;
      }
    }
  }

  &__controls {
    z-index: 2;
    @extend .material-icons;
    position: absolute;
    background-color: #08415c;
    padding: 12px;
    font-size: 36px;
    box-shadow: 4px 4px 16px rgba(0, 0, 0, 0.25);
    top: 66%;
    cursor: pointer;
    user-select: none;
    transition: opacity 0.33s ease-in-out, transform 0.33s ease-in-out;

    &.hidden {
      opacity: 0;
    }

    &--left {
      left: 0;
      margin-left: 28px;

      &.hidden {
        transform: translateX(-50px) translateY(5px);
      }
    }

    &--right {
      right: 0;

      &.hidden {
        transform: translateX(50px) translateY(5px);
      }
    }
  }
}
</style>

<script>
import { Carousel } from "vue-carousel";
import Slide from "@/components/HomepageUILarge/Slide";
import VideoList from "@/components/HomepageUILarge/VideoList";
import NavigationBar from "@/components/HomepageUILarge/NavigationBar";
import MenuUI from "@/components/HomepageUILarge/Menu";
import VideoDescription from "@/components/HomepageUILarge/VideoDescription";
import Footer from "@/components/Footer"

export default {
  name: "HomepageUILargeComponent",
  components: {
    Carousel,
    Slide,
    VideoList,
    Footer,
    NavigationBar,
    "menu-ui": MenuUI,
    VideoDescription,
  },
  data() {
    return {
      videoListMenu: false,
      videoListHeight: 0,
      animate: false,
    };
  },
  computed: {
    videoList() {
      return this.$store.state.videoList;
    },
    currentIndex() {
      return this.$store.state.currentVideo;
    },
    hasVideos() {
      return this.$store.getters.hasVideos;
    },
    currentVideo() {
      return this.hasVideos
        ? this.videoList[this.currentIndex]
        : this.$store.getters.emptyEpisode;
    },
  },
  methods: {
    onPageChange(newSlide) {
      this.setCurrentVideo(newSlide);
    },
    setCurrentVideo(index) {
      this.$store.commit("setCurrentVideo", index);
    },
    nextSlide() {
      if (this.currentIndex + 1 >= this.videoList.length) {
        this.setCurrentVideo(0);
      } else {
        this.setCurrentVideo(this.currentIndex + 1);
      }
    },
    previousSlide() {
      if (this.currentIndex - 1 < 0) {
        this.setCurrentVideo(this.videoList.length - 1);
      } else {
        this.setCurrentVideo(this.currentIndex - 1);
      }
    },
    toggleVideoList() {
      this.videoListMenu = !this.videoListMenu;
    },
    closeVideoList() {
      this.videoListMenu = false;
    },
    getButtonText() {
      if(this.videoListMenu) {
        return 'keyboard_arrow_upward'
      } else {
        return 'All Films'
      }
    },
    hideList() {
      this.animate = false;
    }
  },
  mounted() {
    requestAnimationFrame(() => {
      this.videoListHeight =
        Math.max(
          this.$refs.videoListWrapper.$el.getBoundingClientRect().height,
          510
        ) + "px";
    });
    this.animate = true;
  },
};
</script>
