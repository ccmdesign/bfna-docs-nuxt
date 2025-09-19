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
  },
  cardId: {
    type: String,
    default: null
  },
  hideSeriesChip: {
    type: Boolean,
    default: false
  },
  hoveredCard: {
    type: String,
    default: null
  },
  isTrailer: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['setHoveredCard', 'clearHoveredCard'])

const handleMouseEnter = () => {
  emit('setHoveredCard', props.video.videoId)
}

const handleMouseLeave = () => {
  emit('clearHoveredCard')
}

// Use computed to determine if this card is hovered:
const isHovered = computed(() => props.hoveredCard === props.cardId)

function isVimeo(url) {
  return /vimeo\.com/.test(url)
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
const route = useRoute();
const videoStore = useVideoStore();
const moreInfo = (video) => {
  videoStore.setCurrentVideo(video);
  
  if (props.isTrailer && route.name !== 'index') {
    nextTick(() => {
      videoStore.setTrailer(true);
      videoStore.setIsPlaying(true);
    });
  } else {
    setTimeout(() => {
      router.push({
        name: `video-detail`,
        path: video.slug,
        params: { slug: video.slug }
      });
    }, 100);
  }
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

const posterImage = computed(() => {
  const posterFromResources = props.video.resources.find(resource => resource.type === 'image');
  return props.video.video_info && props.video.video_info.poster ? props.video.video_info.poster : posterFromResources ? posterFromResources.url : props.video.backgroundImage;
});

const serieTitle = computed(() => {
  return videoStore.getSerieTitle(props.video.series && props.video.series.length ? props.video.series[0]?.serieId : null)
})

const isMobile = computed(() => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 768px)').matches;
})

</script>

<template>
  <div
    class="card | stack"
    :poster="poster"
    :thumbnail="thumbnail"
    @pointerenter="handleMouseEnter"
    @pointerleave="handleMouseLeave"
    @click="moreInfo(video)">
        
      <template v-if="poster">
        <img class="card__poster" :src="posterImage" :alt="video.title" />
      </template>
      <template v-else>
        <div :class="{ 'card__video--hovered': isHovered }" class="card__video card__video--bg" :style="backgroundStyle" style="position: relative;" @click="handleCurrentVideo(video)">
          <Transition name="fade-gif">
            <img 
              v-if="!featured && isHovered && !poster && isVimeo(video.videoUrl)"
              ref="videoRef"
              class="card__video card__video--fade"
              :src="video.animatedThumbnail"
              :muted="true"
              loop 
              playsinline
              autoplay 
              preload="auto"
            />
          </Transition>
          <!-- <DocsAwardFlagOnly v-if="video.awards && video.awards.length" /> -->
          <!-- <DocsSeriesChip class="chip-pos" v-if="!hideSeriesChip && video.series && video.series.length" /> -->
        </div>
      </template>
    <slot name="content" v-if="isMobile && !thumbnail && !poster">
      <div class="card__content-wrapper">
        <div class="card__content | stack">
          <h2 class="card__title"><nuxt-link @click="moreInfo(video)">{{ video.title }}</nuxt-link></h2>
          <h3 class="card__subtitle">{{ video.subtitle }}</h3>
          <h3 v-show="serieTitle" class="card__subtitle">Series: {{ serieTitle }}</h3>
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
  border-radius: var(--border-radius-s);
  > * { --_stack-space: var(--space-3xs);}
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
  border-radius: var(--border-radius-s);

  [thumbnail="true"] & {
    border-radius: var(--border-radius-s);
  }
}

.card__video--hovered {
  transform: scale(1.02);
  transition: transform 0.3s ease;
  box-shadow: 
    0 0 20px 0 rgba(255, 255, 255, 0.1),
    0 0 10px 0 rgba(255, 255, 255, 0.5),
    0 0 4px 0 rgba(255, 255, 255, 0.5)
    ;
}

.card__title a {
  font-size: var(--size-0);
  font-weight: 600;
  letter-spacing: 0.04em;
  margin: 0;
  text-decoration: none;
  color: var(--white-color);
}

.card__subtitle{
  font-size: var(--size--1);
  color: var(--white-color-30-shade);

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
  border-radius: var(--border-radius-s);
  aspect-ratio: 1/1.42;

  &:hover {
    border: solid 2px var(--white-color);
  }
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
  transform: scale(1.05);
}

.chip-pos {
  position: absolute;
  bottom: 8px;
  left: 8px;
  z-index: 2;
  
}

/* Fade transition for GIF */
.fade-gif-enter-active, .fade-gif-leave-active {
  transition: opacity 0.3s ease;
}
.fade-gif-enter-from, .fade-gif-leave-to {
  opacity: 0;
}
.fade-gif-enter-to, .fade-gif-leave-from {
  opacity: 1;
}

.card__video--fade {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
}

</style>
