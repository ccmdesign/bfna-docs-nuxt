<template>
  <NuxtLayout name="default">
    <template #hero>
      <hgroup class="site-title">
        <h1 v-if="!isPlaying" class="site-title__title">Critical Stories for Our Complex World</h1>
      </hgroup>
      <docs-hero-headings id="hero" :is-index="true" />
    </template>

    <h2 class="h3 | featured-title" split-right>Featured Videos</h2>
    <div class="featured-reel-wrapper">
      <button
        type="button"
        class="featured-reel__nav featured-reel__nav--left"
        :class="{ 'featured-reel__nav--visible': showLeftArrow }"
        :disabled="!showLeftArrow"
        aria-label="Scroll featured videos left"
        @click="scrollFeatured('left')"
      >
        <span class="material-symbols-outlined featured-reel__icon" aria-hidden="true">
          chevron_left
        </span>
      </button>
      <docs-reel
        ref="featuredReelComponent"
        id="featured-reel"
        :style="featuredReelStyle"
      >
        <template #reel>
          <!-- First 4 posters are above the fold, so they load eagerly. -->
          <docs-card v-for="(i, index) in videoStore.featuredVideosList" :video="i" poster :eager="index < 4" :key="i.id"></docs-card>
          <!-- <docs-card v-for="i in 5" :video="i" poster :key="i.id"></docs-card> -->
        </template>
      </docs-reel>
      <button
        type="button"
        class="featured-reel__nav featured-reel__nav--right"
        :class="{ 'featured-reel__nav--visible': showRightArrow }"
        :disabled="!showRightArrow"
        aria-label="Scroll featured videos right"
        @click="scrollFeatured('right')"
      >
        <span class="material-symbols-outlined featured-reel__icon" aria-hidden="true">
          chevron_right
        </span>
      </button>
    </div>

    <docs-tools id="grid-heading" />
      
    <docs-grid id="grid" :videos="videos" />
  </NuxtLayout>
</template>

<script setup>
import { useVideoStore } from '~/stores/video';

definePageMeta({
  layout: false
});

const videoStore = useVideoStore();
const { filterOptions, isPlaying } = storeToRefs(videoStore);
const featuredReelComponent = ref(null);
const featuredReelElement = ref(null);
const showLeftArrow = ref(false);
const showRightArrow = ref(false);
const isMobile = ref(false);

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

const videos = computed(() => {
  return videoStore.videoList.filter(video => {
    if (filterOptions.value.durationRange !== 'all') {
      const duration = video?.video_info?.duration ?? 0
      const [min, max] = filterOptions.value.durationRange.split('-').map(Number)
      if (max) {
        if (duration < min || duration > max) return false
      } else if (duration < min) {
        return false
      }
    }
    return filterOptions.value.workstream === 'all' || video.workstream === filterOptions.value.workstream
  }).sort((a, b) => {
    const dateA = a?.date ?? ''
    const dateB = b?.date ?? ''
    return filterOptions.value.sort === 'desc' ? dateB.localeCompare(dateA) : dateA.localeCompare(dateB)
  })
})

const featuredReelStyle = computed(() => {
  return videoStore.featuredVideosList.length < 4
    ? { justifyContent: 'flex-start' }
    : {};
});

let scrollRafId = null;

const detachFeaturedReelListener = () => {
  if (featuredReelElement.value) {
    featuredReelElement.value.removeEventListener('scroll', handleFeaturedReelScroll);
    featuredReelElement.value.removeEventListener('wheel', stopScrollAnimation);
    featuredReelElement.value.removeEventListener('touchstart', stopScrollAnimation);
  }
  stopScrollAnimation();
  if (scrollRafId !== null) {
    cancelAnimationFrame(scrollRafId);
    scrollRafId = null;
  }
};

// Coalesce scroll events to at most one layout read per frame so momentum
// scrolling doesn't thrash layout while updating the nav arrow visibility.
const handleFeaturedReelScroll = () => {
  if (scrollRafId !== null) return;
  scrollRafId = requestAnimationFrame(() => {
    scrollRafId = null;
    updateNavigationVisibility();
  });
};

const updateNavigationVisibility = () => {
  const reel = featuredReelElement.value;
  if (!reel) {
    showLeftArrow.value = false;
    showRightArrow.value = false;
    return;
  }

  const tolerance = 1;
  const hasOverflow = reel.scrollWidth - reel.clientWidth > tolerance;

  if (!hasOverflow) {
    showLeftArrow.value = false;
    showRightArrow.value = false;
    return;
  }

  showLeftArrow.value = reel.scrollLeft > tolerance;
  showRightArrow.value = reel.scrollLeft + reel.clientWidth < reel.scrollWidth - tolerance;
};

const attachFeaturedReelElement = () => {
  detachFeaturedReelListener();

  const component = featuredReelComponent.value;
  const root = component?.root ?? component?.$el ?? null;

  if (root instanceof HTMLElement) {
    featuredReelElement.value = root;
    featuredReelElement.value.addEventListener('scroll', handleFeaturedReelScroll, { passive: true });
    // A manual gesture takes over from any in-flight arrow animation.
    featuredReelElement.value.addEventListener('wheel', stopScrollAnimation, { passive: true });
    featuredReelElement.value.addEventListener('touchstart', stopScrollAnimation, { passive: true });
    updateNavigationVisibility();
  } else {
    featuredReelElement.value = null;
    updateNavigationVisibility();
  }
};

// Arrow navigation runs its own rAF animation instead of native
// scrollTo({ behavior: 'smooth' }): the native version restarts its easing
// curve from zero velocity on every click, so rapid clicks made the reel
// stall ("freeze"). Approaching the target exponentially lets a new click
// simply move the target — the motion continues seamlessly.
let scrollAnimId = null;
let scrollAnimTarget = null;
let scrollAnimLastTs = null;

function stopScrollAnimation() {
  if (scrollAnimId !== null) {
    cancelAnimationFrame(scrollAnimId);
    scrollAnimId = null;
  }
  scrollAnimTarget = null;
  scrollAnimLastTs = null;
  featuredReelElement.value?.classList.remove('is-animating');
}

const stepScrollAnimation = (ts) => {
  const reel = featuredReelElement.value;
  if (!reel || scrollAnimTarget === null) {
    stopScrollAnimation();
    return;
  }

  const dt = scrollAnimLastTs === null ? 16 : ts - scrollAnimLastTs;
  scrollAnimLastTs = ts;

  const remaining = scrollAnimTarget - reel.scrollLeft;
  if (Math.abs(remaining) <= 1) {
    reel.scrollLeft = scrollAnimTarget;
    stopScrollAnimation();
  } else {
    // Time-based exponential ease-out: frame-rate independent.
    reel.scrollLeft += remaining * (1 - Math.exp(-dt / 90));
    scrollAnimId = requestAnimationFrame(stepScrollAnimation);
  }
  updateNavigationVisibility();
};

const animateScrollTo = (reel, target) => {
  scrollAnimTarget = target;
  if (scrollAnimId === null) {
    // Suspend card hover effects while animating so pointer churn can't
    // trigger layout/paint work mid-scroll.
    reel.classList.add('is-animating');
    scrollAnimLastTs = null;
    scrollAnimId = requestAnimationFrame(stepScrollAnimation);
  }
};

const scrollFeatured = (direction) => {
  const reel = featuredReelElement.value;
  if (!reel) {
    return;
  }

  const firstCard = reel.querySelector('.card');
  const styles = getComputedStyle(reel);
  const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
  // offsetWidth ignores any in-flight hover scale transform.
  const cardWidth = firstCard ? firstCard.offsetWidth : reel.clientWidth / 4;
  const distance = 3 * (cardWidth + gap);
  const maxScrollLeft = Math.max(reel.scrollWidth - reel.clientWidth, 0);
  // Chain from the pending target (not the current position) so rapid
  // clicks accumulate into one continuous glide.
  const base = scrollAnimTarget ?? reel.scrollLeft;
  const step = direction === 'right' ? distance : -distance;
  const target = Math.min(Math.max(base + step, 0), maxScrollLeft);

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    stopScrollAnimation();
    reel.scrollLeft = target;
    updateNavigationVisibility();
    return;
  }

  animateScrollTo(reel, target);
};

onMounted(() => {
  nextTick(() => {
    attachFeaturedReelElement();
  });
  checkMobile();
  window.addEventListener('resize', updateNavigationVisibility);
  window.addEventListener('resize', checkMobile);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateNavigationVisibility);
  window.removeEventListener('resize', checkMobile);
  detachFeaturedReelListener();
});

watch(
  () => videoStore.featuredVideosList.length,
  () => {
    nextTick(() => {
      attachFeaturedReelElement();
    });
  }
);

</script>

<style scoped>
/* Custom Styles for Hero at Homepage */

:deep(.site-logo) {
  
}

.site-title {
  grid-column: content-start / 10;
  grid-row: 2 / 3;
  align-self: center;
  z-index: 1;

  @media (max-width: 768px) {
    grid-column: content-start / content-end;
  }
}

.site-title__title {
  font-size: calc(var(--size-5) * 1.5);
  font-weight: 700;
  text-wrap: balance;
  
}

.hero-headings--index {
  grid-column: 8 / 14;
  grid-row: 2 / 3;
  justify-self: end;
  align-self: end;
  text-align: right;
  padding-bottom: var(--space-l);

  @media (max-width: 768px) {
    grid-column: content-start / content-end;
    justify-self: start;
    text-align: left;
  }
}

h2 {
  font-weight: bold;
}

#latest-reel {
  grid-row: 6 / 7;
  z-index: 1;
}

#grid-heading {
  grid-row: 7 / 8;
  z-index: 1;
}

#grid {
  grid-row: 8 / 9;
  z-index: 1;
}

.featured-title {
  transform: translateY(1rem);
  grid-column: content-start / content-end;
}

.featured-reel-wrapper {
  position: relative;
  grid-column: full-start / full-end;
  display: grid;
}

#featured-reel {
  padding-block: 1rem;
  padding-block-end: var(--space-xs-l);
  /* NOTE: no `scroll-behavior: smooth` here — arrow navigation animates
     scrollLeft itself, and CSS smooth scrolling would fight it. */
}

/* While the arrows are animating the reel, cards sliding under the cursor
   must not fire hover effects (scale/outline) — that layout/paint work is
   what made navigation stutter. */
#featured-reel.is-animating :deep(.card) {
  pointer-events: none;
}

#featured-reel .card {
  @media (min-width: 769px) {
    flex: 0 0 calc((100% - (3 * var(--base-gutter))) / 4);
    max-width: calc((100% - (3 * var(--base-gutter))) / 4);
  }
}

.featured-reel__nav {
  position: absolute;
  inset-block-start: 50%;
  inline-size: 2rem;
  block-size: 3rem;
  display: grid;
  place-items: center;
  transform: translateY(-50%);
  background-color: transparent;
  border: none;
  border-radius: 999px;
  color: var(--white-color);
  cursor: pointer;
  z-index: 2;
  /* Arrows fade in/out instead of being added/removed with v-if: inserting
     DOM mid-scroll invalidated layout and interrupted the animation. */
  opacity: 0;
  pointer-events: none;
  transition: background-color 0.2s ease, transform 0.2s ease, opacity 0.2s ease;

  &.featured-reel__nav--visible {
    opacity: 1;
    pointer-events: auto;
  }

  &:hover {
    background-color: transparent;
    transform: translateY(-50%) scale(1.05);
  }

  &:focus-visible {
    outline: 2px solid var(--white-color);
    outline-offset: 2px;
  }

  @media (max-width: 768px) {
    display: none;
  }
}

.featured-reel__nav--left {
  inset-inline-start: var(--space-xs-m);
}

.featured-reel__nav--right {
  inset-inline-end: var(--space-xs-m);
}

.featured-reel__icon {
  font-size: 3rem;
  line-height: 1;
}

</style>
