<template>
  <div class="card" :thumbnail="thumbnail">
    <video 
      ref="videoRef"
      @mouseenter="playVideo" @mouseleave="pauseVideo"
      class="card__video" 
      src="/assets/sample-video.webm" 
      :muted="true"
      loop 
      playsinline 
      preload="auto"
    ></video>
    <slot name="content" v-if="!thumbnail">
      <div class="card__content | stack">
        <h2 class="card__title"><nuxt-link to="/detail-page">Card Title</nuxt-link></h2>
        <div class="card__meta | cluster">
          <docs-meta>28min</docs-meta>
          <docs-meta>2023</docs-meta>
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
</script>

<style scoped>

/* Docs Card Layout - SubGrid */

.card {
  width: 100%;

  &:hover {
    
  }
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
