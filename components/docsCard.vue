<!-- <template>
  <div class="card" :thumbnail="thumbnail">
    <video 
      ref="videoRef"
      @mouseenter="playVideo" @mouseleave="pauseVideo"
      class="card__video" 
      :src="video.videoUrl" 
      :muted="true"
      loop 
      playsinline 
      preload="auto"
    ></video>
    <slot name="content" v-if="!thumbnail">
      <div class="card__content | stack">
        <h2 class="card__title"><nuxt-link to="/detail-page">{{ video.title }}</nuxt-link></h2>
        <div class="card__meta | cluster">
          <docs-meta>{{ video.video_info.duration }} min</docs-meta>
          <docs-meta>{{ video.video_info.year }}</docs-meta>
        </div>
      </div>
    </slot>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
const props = defineProps({
  thumbnail: {
    type: Boolean,
    default: false
  },
  video: {
    type: Object,
    default: () => ({
      id: '234khjn6-45sdfvklj-2345',
      title: 'Card Title',
      videoUrl: '/assets/sample-video.webm',
      video_info: {
        duration: '35',
        year: '2025'
      }
    })
  }
})

const videoRef = ref(null)

function playVideo() {
  if (videoRef.value) {
    videoRef.value.muted = false
    videoRef.value.play()
  }
}
function pauseVideo() {
  if (videoRef.value) {
    videoRef.value.muted = true
    videoRef.value.pause()
  }
}
</script> -->
<script setup>
import { ref, computed } from 'vue'
const props = defineProps({
  thumbnail: {
    type: Boolean,
    default: false
  },
  video: {
    type: Object,
    default: () => ({
      id: '234khjn6-45sdfvklj-2345',
      title: 'Card Title',
      videoUrl: '/assets/sample-video.webm',
      backgroundImage: '/assets/sample-thumb.jpg',
      video_info: {
        duration: '35',
        year: '2025'
      }
    })
  }
})

const showIframe = ref(false)

let hoverTimeout = null

const handleMouseEnter = () => {
  clearTimeout(hoverTimeout)
  hoverTimeout = setTimeout(() => {
    showIframe.value = true
  }, 400) // 400ms delay, adjust as needed
}

const handleMouseLeave = () =>{
  clearTimeout(hoverTimeout)
  showIframe.value = false
}


// Helper functions for embed URLs
function isYouTube(url) {
  return /youtube\.com|youtu\.be/.test(url)
}
function isVimeo(url) {
  return /vimeo\.com/.test(url)
}
function youtubeEmbedUrl(url) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]+)/)
  return match
    ? `https://www.youtube.com/embed/${match[1]}?rel=0&autoplay=1&mute=1&controls=0&modestbranding=1`
    : ''
}

function vimeoEmbedUrl(url) {
  const match = url.match(/vimeo\.com\/(\d+)/)
  return match ? `https://player.vimeo.com/video/${match[1]}?autoplay=1&background=1&muted=1&#t=50s` : ''
}

const backgroundStyle = computed(() => {
  const imageUrl = props.video.video_info.thumbnail ? props.video.video_info.thumbnail : props.video.video_info.thumb
  
  return {
    backgroundImage: `url('${!props.thumbnail ? imageUrl : props.video.backgroundImage}')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }
})
</script>

<template>
  <div
    class="card"
    :thumbnail="thumbnail"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <template v-if="showIframe && isYouTube(video.videoUrl)">
      <iframe
        class="card__video"
        :src="youtubeEmbedUrl(video.videoUrl)"
        frameborder="0"
        allow="autoplay; encrypted-media"
        allowfullscreen
      ></iframe>
    </template>
    <template v-else-if="showIframe && isVimeo(video.videoUrl)">
      <iframe
        class="card__video"
        :src="vimeoEmbedUrl(video.videoUrl)"
        frameborder="0"
        allow="autoplay; fullscreen"
        allowfullscreen
      ></iframe>
      <!-- <vimeoPlayer
        class="card__video"
        :vimeo-url="video.videoUrl"
        :autoplay="true"
        playsinline
        allowfullscreen
        ref="player"
      ></vimeoPlayer> -->
    </template>
    <template v-else>
      <div class="card__video card__video--bg" :style="backgroundStyle"></div>
    </template>
    <slot name="content" v-if="!thumbnail">
      <div class="card__content | stack">
        <h2 class="card__title"><nuxt-link to="/detail-page">{{ video.title }}</nuxt-link></h2>
        <div class="card__meta | cluster">
          <docs-meta>{{ video.video_info.duration }} min</docs-meta>
          <docs-meta>{{ video.video_info.year }}</docs-meta>
        </div>
      </div>
    </slot>
  </div>
</template>

<style scoped>

/* Docs Card Layout - SubGrid */

.card {
  width: 100%;
  border-radius: var(--border-radius-m);
}

.card__content {
  --_stack-space: var(--space-3xs);
}

.card__video {
  width: 100%;
  object-fit: cover;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: var(--border-radius-m);

  [thumbnail="true"] & {
    border-radius: var(--border-radius-s);
  }
}

.card__title a {
  font-size: var(--size-0);
  font-weight: 600;
  letter-spacing: 0.04em;
  margin: 0;
  text-decoration: none;
  color: var(--white-color);
}

.card {
  transition: all 0.3s ease-in-out;
  gap: var(--space-3xs-2xs);
  
  @media (max-width: 320px) { 
    grid-column: content-start / content-end; 
  }
  @media (min-width: 321px) and (max-width: 768px) { grid-column: span 6; }

  @media (min-width: 769px) {
    grid-column: span 3;
    transform-origin: top left;
  }
}


/* TODO: Add hover effect with transition */
/* Exploring transitions for hover effect */
.card {
  transition: all 1s ease-in-out;
  cursor: pointer;
  transform-origin: center;

  .card__content {
    transition: padding 1s ease-in-out, background-color .3s ease-in-out;
  }
  
  .card__video {
    border-radius: var(--border-radius-m);
    border: 1px solid transparent;
  }
  
}

.card:hover {
  position: relative;
  z-index: 10;
  transform: scale(1.25);
  background-color: var(--white-color-10-shade);
  border-radius: 0 0 var(--border-radius-m) var(--border-radius-m);
  
  :not([thumbnail="true"]) .card__video {
    border-radius: var(--border-radius-m) var(--border-radius-m) 0 0;
  }

  .card__video {
    border: 1px solid var(--white-color);
    border-radius: var(--border-radius-m) var(--border-radius-m) 0 0;
    
    box-shadow: 
      0 0 20px 0 rgba(255, 255, 255, 0.1),
      0 0 10px 0 rgba(255, 255, 255, 0.5),
      0 0 4px 0 rgba(255, 255, 255, 0.5)
      ;
  }
  
  .card__content {
    padding: var(--space-xs);
    h2 { font-size: var(--size--3); }
  }

  .card__meta {
    font-size: var(--size--3);
  }
  
}


</style>
