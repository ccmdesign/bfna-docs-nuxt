<script setup>
import { ref, computed } from 'vue'
import { useVideoStore } from '~/stores/video';

const props = defineProps({
  thumbnail: {
    type: Boolean,
    default: false
  },
  featured: {
    type: Boolean,
    default: false
  },
  poster: {
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
const handleMouseEnter = () => {
  showIframe.value = true
}

const handleMouseLeave = () =>{
  showIframe.value = false

  const iframeElement = document.querySelector('iframe');
  if (iframeElement) {
    nextTick(() => {
      iframeElement.src = ''; // Stop the video from playing
      iframeElement.removeAttribute('src'); // Remove the src attribute to stop loading
      iframeElement.setAttribute('style', 'display: none;'); // Hide the iframe
      iframeElement.remove();
    });
  }
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
  return match ? `https://player.vimeo.com/video/${match[1]}?autoplay=1&background=0&muted=1&#t=15s` : ''
}

const backgroundStyle = computed(() => {
  const imageUrl = props.video.video_info.thumbnail ? props.video.video_info.thumbnail : props.video.video_info.thumb
  
  return {
    backgroundImage: `url('${props.thumbnail ? imageUrl : props.video.backgroundImage}')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }
})

const router = useRouter();
const videoStore = useVideoStore();
const moreInfo = (video) => {
  videoStore.setCurrentVideo(video);
  
  setTimeout(() => {
    router.push({
      name: `video-detail`,
      path: video.slug,
      params: { slug: video.slug }
    });
  }, 100);
}

const handleCurrentVideo = (video) => {
  videoStore.setCurrentVideo(video);
  videoStore.setIsPlaying(true);
  toTop();

}

const toTop = () => {
  window.scroll({
    top: 0, 
    left: 0, 
    behavior: 'smooth'
  });
}

const handlePlayVideo = (video) => {
  videoStore.setCurrentVideo(video);
  videoStore.setIsPlaying(true);
  toTop();
}

</script>

<template>
  <div
    class="card"
    :poster="poster"
    :thumbnail="thumbnail"
    @pointerenter="handleMouseEnter"
    @pointerleave="handleMouseLeave"
    @click="handleCurrentVideo(video)">
        
    <template v-if="!featured && showIframe && !poster && isYouTube(video.videoUrl)">
      <iframe
        :key="showIframe + video.videoUrl"
        class="card__video"
        :src="youtubeEmbedUrl(video.videoUrl)"
        frameborder="0"
        allow="autoplay; encrypted-media"
        allowfullscreen
      ></iframe>
    </template>

    <template v-else-if="!featured && showIframe && !poster && isVimeo(video.videoUrl)">
      <iframe
        :key="showIframe + video.videoUrl"
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
      <!-- <img 
        ref="videoRef"
        class="card__video" 
        src="https://videoapi-muybridge.vimeocdn.com/animated-thumbnails/image/3c668970-f366-4d08-b7d7-a7e4ed41857e.gif?ClientID=sulu&Date=1749682948&Signature=d6992d6fd2734b57e2f958383092ac7acad5c256" 
        :muted="true"
        loop 
        playsinline
        autoplay 
        preload="auto"
      ></img> -->
    </template>
    <template v-else-if="poster">
      <img class="card__poster" src="/assets/poster-example.jpg" /> <!-- @douglas -->
      
    </template>
    <template v-else>
      <div class="card__video card__video--bg" :style="backgroundStyle" style="position: relative;" @click="handleCurrentVideo(video)">
        <!-- <DocsAwardFlagOnly v-if="video.awards && video.awards.length" /> -->
        <DocsSeriesChip class="chip-pos" v-if="video.series && video.series.length" />
      </div>
    </template>
    <slot name="content" v-if="!thumbnail && !poster">
      <div class="card__content-wrapper">
          <span v-if="showIframe" @click="handlePlayVideo(video)" class="material-symbols-outlined" style="font-size: 48px;">play_circle</span>
        <div class="card__content | stack">
          <h2 class="card__title"><nuxt-link @click="moreInfo(video)">{{ video.title }}</nuxt-link></h2>
          <div class="card__meta | cluster">
            <docs-meta>{{ video.video_info.duration }} min</docs-meta>
            <docs-meta>{{ video.video_info.year }}</docs-meta>
          </div>
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

.card__content-wrapper {
  display: flex;
  align-items: center;
  gap: var(--space-3xs);
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

.card[poster="true"] {
  max-width: calc(50% - (4 * var(--space-xs-m)));

  @media (min-width: 321px) and (max-width: 768px) {
    max-width: calc(40% - (4 * var(--space-xs-m)));
  }
  @media (min-width: 769px) {
    max-width: calc(20% - var(--base-gutter)*2); /* @NOTE: Magic number */
  }
}

.card__poster {
  width: 100%;
  object-fit: cover;
  border-radius: var(--border-radius-m);
  aspect-ratio: 1/1.42;
}


/* TODO: Add hover effect with transition */
/* Exploring transitions for hover effect */
.card {
  transition: all .5s ease-in-out;
  cursor: pointer;
  transform-origin: center;

  .card__content {
    transition: padding .5s ease-in-out, background-color .3s ease-in-out;
  }
  
  .card__video {
    border-radius: var(--border-radius-m);
    border: 1px solid transparent;
  }
}

.card[thumbnail="true"]:hover {
  position: relative;
  z-index: 10;
  transform: scale(1.1);
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
    padding: var(--space-xs) var(--space-xs) var(--space-xs) 0;
    h2 { font-size: var(--size--3); }
  }

  .card__meta {
    font-size: var(--size--3);
  }
  
}

.card[poster="true"]:hover {
  transform: scale(1.1);
}

.chip-pos {
  position: absolute;
  bottom: 8px;
  left: 8px;
  z-index: 2;
}

</style>
