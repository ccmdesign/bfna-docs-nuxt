<template>
<div>
  <div class="video-list gradient">
    <div class="video-list__featured-section">
      <h3 class="section-title">Featured</h3>
      <div class="featured-list">
        <div v-for="(video, index) in featured
        " :key="index" >
          <div class="video-list__episode video-list__episode--featured" @click="selectEpisode(video.videoUrl)" :data-title="video.title" :aria-label="video.title">
            <div
              class="video-list__episode-thumbnail"
              :style="{ backgroundImage: `url('${video.backgroundImage}')` }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="video-list">
    <div class="video-list__workstreams-section">
      <h3 class="section-title | videolist-main-title">All documentaries</h3>
      <div
        class="child workstream--democracy"
        @click="selectWorkstream('democracy')"
        :class="{ selected: isWorkstreamSelected('democracy'), disabled:  !workstreamVideos('democracy') }"
      >
        <h2>Democracy</h2>
      </div>
      <div
        class="child workstream--politics-society"
        @click="selectWorkstream('politics-society')"
        :class="{ selected: isWorkstreamSelected('politics-society'), disabled:  !workstreamVideos('politics-society') }"
      >
        <h2>Politics &amp; Society</h2>
      </div>
      <div
        class="child workstream--future-of-work"
        @click="selectWorkstream('future-of-work')"
        :class="{ selected: isWorkstreamSelected('future-of-work'), disabled:  !workstreamVideos('future-of-work')  }"
      >
        <h2>Future Leadership</h2>
      </div>
      <div
        class="child workstream--digital-economy"
        @click="selectWorkstream('digital-economy')"
        :class="{ selected: isWorkstreamSelected('digital-economy'), disabled:  !workstreamVideos('digital-economy') }"
      >
        <h2>Digital World</h2>
      </div>
    </div>
    <div class="video-list__list">
      <div class="video-list__episode" v-for="(video, index) in videoList" :key="index" @click="selectEpisode(video.videoUrl)">
        <div
          class="video-list__episode-thumbnail"
          :style="{ backgroundImage: `url('${video.backgroundImage}')` }"
        />

        <div class="video-list__episode-info">
          <h4>{{ video.title }}</h4>
          <h3>{{ video.subtitle }}</h3>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<!--
<style lang="scss" scoped>
.video-list__episode--featured {
  position: relative;
  &:after {
    text-align: center;
    content: attr(data-title);
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.5em;
    letter-spacing: 0.02em;
    font-weight: 700;
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
  }
  &:hover {
    &::after {
      opacity: 1;
    }
  }
}

.video-list__featured-section {
  padding-bottom: 128px;
}

.section-title {
  text-transform: uppercase;
  font-weight: 700;
  font-size: 1.5em;
  letter-spacing: 0.02em;
  &.videolist-main-title {
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    margin: 0;
  }
}

.featured-list {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 32px;
}

.video-list {
  &.gradient{
    background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,8,12,1) 10%, rgba(0,8,12,1) 100%);
  }
  background: rgba(0,8,12,1);
  position: relative;
  padding: 12px 170px 64px;

  &__list {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 32px;
  }

  &__episode {
    cursor: pointer;
    box-shadow: 0px 8px 32px #00000026;
    border: 1px solid #ffffff33;
    //width: 20vw;

    &:first-child {
      margin-left: 0;
    }

    &-thumbnail {
      height: 11.25vw;
      background-repeat: no-repeat;
      background-size: cover;
      background-position: center center;
    }

    &-info {
      padding: 20px 24px;
      background-color: #00000059;
      h3 {
        margin: 0;
      }
    }

    h4 {
      color: #ffffff;
      font-size: 1.25em;
      font-weight: 700;
      letter-spacing: 0.21px;
      line-height: 18px;
    }

    h3 {
      color: #ffffff;
      font-size: 0.875em;
      letter-spacing: 0.21px;
      line-height: 16px;
    }
  }

  &__workstreams-section {
    margin-bottom: 64px;
    display: flex;
    justify-content: center;
    position: relative;
    .child + .child { 
      margin-left: 2rem;
    }

    .child {
      --button-color: #ffffff;
      --bg-color: #000;


      padding: 0;
      border: 3px solid var(--button-color);
      background-color: var(--bg-color);

      &.workstream--democracy { --button-color: #4f8d71; }
      &.workstream--politics-society { --button-color: #fc8b00; }
      &.workstream--future-of-work { --button-color: #c73540; }
      &.workstream--digital-economy { --button-color: #631764; }

      h2 {
        margin: 0;
        padding: 0;
        line-height: 54px;
        height: 54px;
        width: 214px;
        color: white;
        font-size: 1em;
        letter-spacing: 0.23px;
        text-align: center;
        text-transform: uppercase;
      }

      &.selected {
        --bg-color: var(--button-color);
      }
      &:not(.disabled) {
        cursor: pointer;
      }
      &.disabled {
        pointer-events: none;
        opacity: 0.3;
      }

      @media (max-width: 1350px) { 
        h2 {
          font-size: 0.875em;
          width: 176px;
        }
      }
    }
    @media (max-width: 1800px) { 
      flex-flow: row wrap;
      .section-title {
        &.videolist-main-title {
          width: 100%;
          padding-bottom: 30px;
          position: relative;
          transform: translateY(0)
        }
      }
    }
  }

  &__controls {
    @extend .material-icons !optional;
    position: absolute;
    background-color: #08415c;
    padding: 12px;
    font-size: 36px;
    box-shadow: 4px 4px 16px rgba(0, 0, 0, 0.25);
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;

    &--left {
      left: 0;
    }

    &--right {
      right: 0;
    }
  }
}
</style>
-->

<script>
import utils from "~/composables/utils";
import { PerfectScrollbar } from 'vue2-perfect-scrollbar'
import { useVideoStore } from '~/stores/video'
import { mapState } from 'pinia'

export default {
  components: { PerfectScrollbar },
  data() {
    return {
      currentEpisode: 0,
      selectedWorkstreams: [],
    };
  },
  props: {
    closeAction: {
      type: Function,
      required: false,
    },
  },
  computed: {
    ...mapState(useVideoStore, ['videoList', 'currentVideo']),
    fullVideoList() {
      return this.videoList;
    },
    filteredVideoList() {
      const filter = (item) => {
        return (
          this.selectedWorkstreams.length === 0 ||
          this.selectedWorkstreams.includes(item.workstream)
        );
      };

      return this.videoList.filter(filter);
    },
    featured() {
      // For now, we'll use videoList directly since featured is not in the Pinia store
      return this.videoList;
    },
    maxPages() {
      return Math.floor(this.filteredVideoList.length / 4);
    },
    currentIndex() {
      return this.currentVideo;
    },
    hasVideos() {
      const videoStore = useVideoStore();
      return videoStore.hasVideos;
    },
    currentVideoObj() {
      const videoStore = useVideoStore();
      return this.hasVideos
        ? this.filteredVideoList[this.currentIndex]
        : videoStore.emptyEpisode;
    },
  },
  methods: {
    getVideoThumbnail(video) {
      const videoId = video.source == 'youtube' ? utils.getVideoIdFromYoutubeUrl(video.videoUrl) : utils.getVideoIdFromVimeoUrl(video.videoUrl);
      return videoId
        ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
        : "";
    },
    nextEpisode() {
      this.$refs.videoList.handleNavigation("forward");
    },
    previousEpisode() {
      this.$refs.videoList.handleNavigation("backward");
    },
    selectEpisode(url) {
      if (process.client) {
        window.scroll({
          top: 0, 
          left: 0, 
          behavior: 'smooth'
        });
      }
      const videoStore = useVideoStore();
      videoStore.setCurrentVideo(url);
      if (this.closeAction) {
        this.closeAction();
      }
    },
    selectWorkstream(workstream) {
      const index = this.selectedWorkstreams.indexOf(workstream);

      if (index > -1) {
        this.selectedWorkstreams.splice(index, 1);
      } else {
        this.selectedWorkstreams.push(workstream);
      }

      // if (this.selectedWorkstream !== workstream) {
      //   this.selectedWorkstream = workstream

      //   this.$refs.videoList.goToPage(0)
      // } else if (this.selectedWorkstream !== null) {
      //   this.selectedWorkstream = null
      //   this.$refs.videoList.goToPage(0)
      // }
    },
    isWorkstreamSelected(workstream) {
      return this.selectedWorkstreams.includes(workstream);
    },
    workstreamVideos(workstream) {
      const qtd = this.fullVideoList.filter((item) => {
        return item.workstream == workstream
      }).length;
      return qtd >= 1;
    }
  },
};
</script>
<style src="vue2-perfect-scrollbar/dist/vue2-perfect-scrollbar.css"/>
