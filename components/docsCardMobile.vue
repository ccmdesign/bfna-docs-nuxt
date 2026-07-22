<script setup>
import { ref, computed, nextTick, onBeforeUnmount } from 'vue'
import { useVideoStore } from '~/stores/video';

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
  },
  isVideoActive: {
    type: Boolean,
    default: false
  },
})


const emit = defineEmits(['cardClicked'])

const isMobile = computed(() => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 768px)').matches;
})

const showIframe = ref(false)
const videoStore = useVideoStore();
const router = useRouter();

const handleCardClick = () => {
  if (!isMobile.value) return;

  if (props.isVideoActive) {
    showIframe.value = true;
  } else {
    showIframe.value = false;
    emit('cardClicked', { cardId: props.video.videoId });
  }
}

const cleanupIframe = () => {
  const iframeElement = document.querySelector('#video-iframe');
  if (iframeElement) {
    iframeElement.src = '';
    iframeElement.removeAttribute('src');
    iframeElement.setAttribute('style', 'display: none;');
    iframeElement.remove();
  }
}

const previewStartsAt = computed(() => {
  return props.video.video_info.preview_start_at || 15;
})

// Helper functions for embed URLs
function isYouTube(url) {
  return /youtube\.com|youtu\.be/.test(url);
}

function isVimeo(url) {
  return /vimeo\.com/.test(url);
}

function youtubeEmbedUrl(url) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]+)/);
  return match
    ? `https://www.youtube.com/embed/${match[1]}?rel=0&autoplay=1&mute=1&controls=0&modestbranding=1`
    : '';
}

function vimeoEmbedUrl(url) {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match ? `https://player.vimeo.com/video/${match[1]}?autoplay=1&background=0&muted=1&#t=${previewStartsAt.value}s` : '';
}

const backgroundStyle = computed(() => {
  const imageUrl = props.video.video_info.thumbnail ? props.video.video_info.thumbnail : props.video.video_info.thumb;

  return {
    backgroundImage: `url('${props.thumbnail ? imageUrl : props.video.backgroundImage}')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };
})

const moreInfo = (event) => {  
  videoStore.setCurrentVideo(props.video);

  setTimeout(() => {
    router.push({
      name: `video-detail`,
      path: props.video.slug,
      params: { slug: props.video.slug }
    });
  }, 100);
}

const handlePlayFromCardMeta = () => {
  videoStore.setCurrentVideo(props.video);
  nextTick(() => {
    videoStore.setIsPlaying(true);
    toTop();
    emit('cardClicked', { cardId: null });
  });
}

const handleCurrentVideo = (event) => {
  // For mobile handling
  if (isMobile.value) {
    event.stopPropagation();
    handleCardClick();
    return;
  }
  
  videoStore.setCurrentVideo(props.video);
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



const cardRef = ref(null);
const handleClickOutside = (event) => {
  if (cardRef.value && !cardRef.value.contains(event.target)) {
    emit('cardClicked', { cardId: null });
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

</script>

<template>
  <div
    ref="cardRef"
    class="card | stack"
    :thumbnail="thumbnail"
    @pointerenter="handleMouseEnter"
    @pointerleave="handleMouseLeave"
    @click="moreInfo">

    <!-- Default image -->
    <template v-if="!isVideoActive || !showIframe">
      <div 
        class="card__video card__video--bg" 
        :style="backgroundStyle" 
        :class="{ 'with-overlay': showIframe }"
        @click="handleCurrentVideo">
        <!-- Overlay for mobile click-to-preview -->
        <div 
          v-if="isMobile && isVideoActive && !showIframe" 
          class="card__overlay"
          @click="handleCurrentVideo">
          <span class="card__overlay-text">Tap to Preview</span>
        </div>
        <!-- <DocsSeriesChip class="chip-pos" v-if="video.series && video.series.length" /> -->
      </div>
    </template>

    <!-- Youtube player -->
    <template v-else-if="isVideoActive && showIframe && isYouTube(video.videoUrl)">
      <iframe
        ref="youtubeIframeRef"
        id="video-iframe"
        :key="showIframe + video.videoUrl"
        class="card__video"
        :src="youtubeEmbedUrl(video.videoUrl)"
        frameborder="0"
        allow="autoplay; encrypted-media"
        allowfullscreen
      ></iframe>
    </template>

    <!-- Vimeo player -->
    <template v-else-if="isVideoActive && showIframe && isVimeo(video.videoUrl)">
      <!-- <iframe
        ref="vimeoIframeRef"
        id="video-iframe"
        :key="showIframe + video.videoUrl"
        class="card__video"
        :src="vimeoEmbedUrl(video.videoUrl)"
        frameborder="0"
        allow="autoplay; fullscreen"
        allowfullscreen
      ></iframe> -->
      <img
        ref="videoRef"
        class="card__video"
        :src="video.animatedThumbnail"
        :muted="true"
        loop
        playsinline
        autoplay
        preload="auto"
        loading="lazy"
        decoding="async"
      ></img>
    </template>

    <!-- Footer - video info -->
    <slot name="content" v-if="!thumbnail">
      <div class="card__content-wrapper">
        <!-- <span 
          v-if="isVideoActive" 
          @click.stop="handlePlayFromCardMeta" 
          class="material-symbols-outlined" 
          style="font-size: 48px;">
          play_circle
        </span> -->
        <div class="card__content | stack">
          <h2 class="card__title">
            <nuxt-link @click.stop="moreInfo">{{ video.title }}</nuxt-link>
          </h2>
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
  position: relative;
  
  > * { --_stack-space: var(--space-3xs);}
}

.card__content-wrapper {
  display: flex;
  align-items: center;
  gap: var(--space-3xs);
  /* --_stack-space: var(--space-3xs); */

  position: relative;
  z-index: 5;
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
  position: relative;

  [thumbnail="true"] & {
    border-radius: var(--border-radius-s);
  }
}

/* Mobile overlay styling */
.card__video--bg {
  position: relative;
}

.card__overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 5;
  border-radius: var(--border-radius-m);
}

.card__overlay-text {
  color: white;
  font-size: var(--size-0);
  font-weight: 600;
  text-align: center;
  padding: var(--space-xs);
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

/* Transitions for hover effect on desktop */
.card {
  transition: all .5s ease-in-out;
  cursor: pointer;
  transform-origin: center;

  .card__content {
    transition: padding .5s ease-in-out, background-color .3s ease-in-out;
  }

  .card__video {
    border-radius: var(--border-radius-m);
    /* border: 1px solid transparent; */
  }
}

/* Only apply hover effects on non-mobile devices */
@media (min-width: 769px) {
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

}

.chip-pos {
  position: absolute;
  bottom: 8px;
  left: 8px;
  z-index: 2;
}

.with-overlay {
  opacity: 1;
}
</style>