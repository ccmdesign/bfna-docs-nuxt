<template>
<div>
  <div v-if="loading" class="video-list-loader">
    <div class="loader-content">
      <img src="/assets/loader.gif" alt="Loading videos" />
      <p>Loading documentaries...</p>
    </div>
  </div>
  <div v-else-if="!videoList.length" class="video-list-empty">
    <div class="empty-content">
      <p>No documentaries found</p>
      <button @click="fetchVideos" class="retry-button">Retry</button>
    </div>
  </div>
  <div v-else>
    <div class="video-list gradient">
      <div class="video-list__featured-section">
        <h3 class="section-title">Featured</h3>
        <div class="featured-list">
          <div v-for="(video, index) in featured" :key="index">
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
          v-for="(label, id) in workstreams" 
          :key="id"
          class="child"
          :class="{
            ['workstream--' + id]: true,
            'selected': isWorkstreamSelected(id),
            'disabled': !workstreamVideos(id)
          }"
          @click="selectWorkstream(id)"
        >
          <h2>{{ label }}</h2>
        </div>
      </div>
      <div class="video-list__list">
        <div v-if="filteredVideoList.length === 0 && selectedWorkstream" class="video-list__empty-category">
          <p>No videos found in this category</p>
          <button @click="selectedWorkstream = ''" class="reset-button">Show all videos</button>
        </div>
        <div class="video-list__episode" v-for="(video, index) in filteredVideoList" :key="index" @click="selectEpisode(video.videoUrl)">
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
</div>
</template>

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

.video-list-loader,
.video-list-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  width: 100%;
  position: relative;
  
  .loader-content,
  .empty-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    
    p {
      margin-top: 16px;
      color: #fff;
      font-size: 1.2em;
    }
  }
  
  img {
    width: 80px;
    height: 80px;
  }
  
  .retry-button {
    margin-top: 16px;
    background: #08415c;
    color: white;
    border: none;
    padding: 8px 24px;
    font-size: 1em;
    cursor: pointer;
    border-radius: 4px;
    transition: background 0.2s;
    
    &:hover {
      background: #0a5272;
    }
  }
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, rgba(11, 13, 14, 0.2) 25%, rgba(11, 13, 14, 0.5) 50%, rgba(11, 13, 14, 0.2) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    z-index: -1;
  }
  
  @keyframes shimmer {
    0% {
      background-position: -100% 0;
    }
    100% {
      background-position: 100% 0;
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

  &__empty-category {
    grid-column: 1 / -1;
    text-align: center;
    padding: 48px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
    
    p {
      color: rgba(255, 255, 255, 0.7);
      font-size: 1.2em;
      margin-bottom: 16px;
    }
    
    .reset-button {
      background: transparent;
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.5);
      padding: 8px 24px;
      font-size: 0.9em;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.2s;
      
      &:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: white;
      }
    }
  }

  &__list {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 32px;
    position: relative;
    min-height: 200px;
    
    &:empty::after {
      content: "No videos found for this category";
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: rgba(255, 255, 255, 0.5);
      font-style: italic;
    }
  }

  &__episode {
    cursor: pointer;
    box-shadow: 0px 8px 32px #00000026;
    border: 1px solid #ffffff33;
    transition: transform 0.2s ease-in-out;
    
    &:hover {
      transform: scale(1.02);
      box-shadow: 0px 12px 36px #00000040;
    }

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
      transition: all 0.25s ease-in-out;
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
        &:hover:not(.selected) {
          opacity: 0.85;
          transform: translateY(-2px);
        }
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
    font-family: 'Material Icons';
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

<script>
import PerfectScrollbar from 'perfect-scrollbar'
import { useVideoStore } from '~/stores/video'

export default {
  name: 'VideoList',
  props: {
    isActive: {
      type: Boolean,
      default: false
    },
    closeAction: {
      type: Function,
      required: false
    }
  },
  data() {
    return {
      selectedWorkstream: '',
      loading: true,
      videoStore: null,
      workstreams: {
        'democracy': 'Democracy',
        'politics-society': 'Politics & Society', 
        'future-of-work': 'Future Leadership',
        'digital-economy': 'Digital World'
      }
    }
  },
  computed: {
    videoList() {
      return this.videoStore?.videoList || []
    },
    filteredVideoList() {
      if (!this.selectedWorkstream) return this.videoList
      
      return this.videoList.filter(video => {
        // Get normalized workstream from video (default to democracy if missing)
        const videoWorkstream = String(video.workstream || 'democracy').toLowerCase()
        
        // Direct match with selected workstream
        return videoWorkstream === String(this.selectedWorkstream).toLowerCase()
      })
    },
    featured() {
      return this.videoList
    },
    // Count how many videos are in each workstream
    workstreamCounts() {
      const counts = {}
      
      // Initialize all workstreams with 0
      Object.keys(this.workstreams).forEach(ws => {
        counts[ws] = 0
      })
      
      // Count videos in each workstream
      this.videoList.forEach(video => {
        const ws = String(video.workstream || 'democracy').toLowerCase()
        if (counts[ws] !== undefined) {
          counts[ws]++
        }
      })
      
      return counts
    }
  },
  async mounted() {
    this.videoStore = useVideoStore()
    await this.fetchVideos()
    
    // Initialize perfect scrollbar
    const container = this.$el.querySelector('.video-list__list')
    if (container) {
      new PerfectScrollbar(container, {
        wheelSpeed: 2,
        wheelPropagation: true,
        minScrollbarLength: 20
      })
    }
  },
  methods: {    
    async fetchVideos() {
      try {
        this.loading = true
        if (this.videoStore && !this.videoStore.hasVideos) {
          await this.videoStore.fetchVideos()
        }
      } catch (error) {
        console.error('Error fetching videos:', error)
      } finally {
        this.loading = false
      }
    },
    
    selectEpisode(videoUrl) {
      // Close the list if there's a close action
      if (this.closeAction) {
        this.closeAction()
      }
      
      // Set the video in the store
      if (this.videoStore) {
        this.videoStore.setCurrentVideo(videoUrl)
        
        // Scroll to top
        if (process.client) {
          window.scroll({
            top: 0,
            left: 0,
            behavior: 'smooth'
          })
        }
      }
    },
    
    selectWorkstream(workstream) {
      if (!this.workstreamVideos(workstream)) return
      
      if (this.selectedWorkstream === workstream) {
        this.selectedWorkstream = ''
      } else {
        this.selectedWorkstream = workstream
      }
    },
    
    isWorkstreamSelected(workstream) {
      return this.selectedWorkstream === workstream
    },
    
    workstreamVideos(workstream) {
      return this.workstreamCounts[workstream] > 0
    }
  }
}
</script>
