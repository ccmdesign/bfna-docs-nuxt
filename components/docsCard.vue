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
  },
  border: {
    type: Boolean,
    defalt: false
  },
  // Above-the-fold cards (first featured-reel posters) opt out of lazy loading.
  eager: {
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

// ponytail: the Directus URLs already carry `?width=<n>&format=webp&quality=80`
// and the transform endpoint accepts any width, so a srcset is just the same URL
// with the width swapped — no imageUrl.js change needed. URLs with no `width=`
// param (originals, SVG, PDF, external resource links) get no srcset at all.
const srcset = (url, widths) => {
  if (!url || !/[?&]width=\d+/.test(url)) return undefined
  return widths.map(w => `${url.replace(/([?&]width=)\d+/, `$1${w}`)} ${w}w`).join(', ')
}

const cardImage = computed(() => {
  const vi = props.video?.video_info
  const imageUrl = vi?.thumbnail ?? vi?.thumb ?? ''
  // ponytail: `props.thumbnail & imageUrl` is a known dead branch (bitwise AND,
  // always falsy). Preserved verbatim — it is tracked separately, not in BF-121.
  return props.thumbnail & imageUrl ? imageUrl : (props.video.backgroundImageCard || props.video.backgroundImage)
})

const cardImageSrcset = computed(() => srcset(cardImage.value, [320, 600]))

const router = useRouter();
const route = useRoute();
const videoStore = useVideoStore();

const videoDetailLink = computed(() => {
  if (props.video?.slug) {
    return { name: 'video-detail', params: { slug: props.video.slug } }
  }
  return '/'
})

const moreInfo = (video) => {
  videoStore.setCurrentVideo(video);
  if (props.poster) {
    toTop();
  }
  if (props.isTrailer && route.name !== 'index') {
    nextTick(() => {
      videoStore.setTrailer(true);
      videoStore.setIsPlaying(true);
    });
  } else if (!props.poster) {
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
  return props.video.video_info && props.video.video_info.poster ? props.video.video_info.poster : posterFromResources ? posterFromResources.url : (props.video.backgroundImageCard || props.video.backgroundImage);
});

const posterImageSrcset = computed(() => srcset(posterImage.value, [200, 400]))

const serieTitle = computed(() => {
  return videoStore.getSerieTitle(props.video.series && props.video.series.length ? props.video.series[0]?.serieId : null)
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
        <img
          class="card__poster"
          :class="{'card__poster-border' : border }"
          :src="posterImage"
          :srcset="posterImageSrcset"
          sizes="(max-width: 320px) 100vw, (max-width: 768px) 40vw, 20vw"
          width="400"
          height="568"
          :alt="video.title"
          :loading="eager ? 'eager' : 'lazy'"
          decoding="async" />
      </template>
      <template v-else>
        <div :class="{ 'card__video--hovered': isHovered }" class="card__video card__video--bg" style="position: relative;" @click="handleCurrentVideo(video)">
          <img
            class="card__video-img"
            :src="cardImage"
            :srcset="cardImageSrcset"
            sizes="(max-width: 320px) 100vw, (max-width: 768px) 50vw, 25vw"
            width="600"
            height="338"
            :alt="video.title"
            :loading="eager ? 'eager' : 'lazy'"
            decoding="async" />
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
    <slot name="content" v-if="!thumbnail && !poster">
      <div class="card__content-wrapper">
        <div class="card__content | stack">
          <h2 class="card__title">
            <nuxt-link
              :to="videoDetailLink"
              @click.prevent="moreInfo(video)"
            >
              {{ video.title }}
            </nuxt-link>
          </h2>
          <h3 class="card__subtitle">{{ video.subtitle }}</h3>
          <h3 v-show="serieTitle" class="card__subtitle">Series: {{ serieTitle }}</h3>
          <div class="card__meta | cluster">
            <docs-meta>{{ video.video_info.duration }} min</docs-meta>
            <docs-meta>{{ video.docYear }}</docs-meta>
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

/* Replaces the old CSS background-image so the card art can lazy-load. The
   wrapper keeps the aspect-ratio/radius/overflow, this just fills it. */
.card__video-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
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
  color: var(--white-color-70-shade);
}

.card {
  /* Only animate the properties that actually change on hover.
     `transition: all` would also animate layout (width/position) whenever
     the reel reflows, making the whole row stutter while scrolling. */
  transition: transform 0.3s ease-in-out, background-color 0.3s ease-in-out;
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
  /* Required because the <img> carries width/height attributes: those become a
     presentational `height: 568px`, and with `width: 100%` also definite the
     aspect-ratio below is ignored (it only applies when one axis is auto).
     Without this the reel posters render 1/1.84 instead of 1/1.42. */
  height: auto;
  object-fit: cover;
  border-radius: var(--border-radius-s);
  aspect-ratio: 1/1.42;

  /* Outline instead of border: paint-only, so hovering mid-scroll never
     triggers layout work (a border resizes the image's content box). */
  &:hover {
    outline: solid 2px var(--white-color);
    outline-offset: -2px;
  }
}

.card__poster-border {
  outline: solid 2px var(--white-color);
  outline-offset: -2px;
}


/* TODO: Add hover effect with transition */
/* Exploring transitions for hover effect */
.card {
  transition: transform .5s ease-in-out, background-color .3s ease-in-out, box-shadow .3s ease-in-out;
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
