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
        v-if="showLeftArrow"
        type="button"
        class="featured-reel__nav featured-reel__nav--left"
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
          <docs-card v-for="i in videoStore.featuredVideosList" :video="i" poster :key="i.id"></docs-card>
          <!-- <docs-card v-for="i in 5" :video="i" poster :key="i.id"></docs-card> -->
        </template>
      </docs-reel>
      <button
        v-if="showRightArrow"
        type="button"
        class="featured-reel__nav featured-reel__nav--right"
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
    // Filter by duration range
    if (filterOptions.value.durationRange !== 'all') {
      const duration = video.video_info.duration;
      const [min, max] = filterOptions.value.durationRange.split('-').map(Number);
      if (max) {
        if (duration < min || duration > max) {
          return false;
        }
      } else {
        if (duration < min) {
          return false;
        }
      }
    }
    return (filterOptions.value.workstream === 'all' || video.workstream === filterOptions.value.workstream);
  }).sort((a, b) => {
    return filterOptions.value.sort === 'desc' ? b.video_info.year - a.video_info.year : a.video_info.year - b.video_info.year;
  });
});

const featuredReelStyle = computed(() => {
  return videoStore.featuredVideosList.length < 4
    ? { justifyContent: 'flex-start' }
    : {};
});

const detachFeaturedReelListener = () => {
  if (featuredReelElement.value) {
    featuredReelElement.value.removeEventListener('scroll', handleFeaturedReelScroll);
  }
};

const handleFeaturedReelScroll = () => {
  updateNavigationVisibility();
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
    updateNavigationVisibility();
  } else {
    featuredReelElement.value = null;
    updateNavigationVisibility();
  }
};

const scrollFeatured = (direction) => {
  const reel = featuredReelElement.value;
  if (!reel) {
    return;
  }

  // const maxScrollLeft = Math.max(reel.scrollWidth - reel.clientWidth, 0);
  // const target = direction === 'right' ? maxScrollLeft : 0;

  // reel.scrollTo({ left: target, behavior: 'smooth' });
  const firstCard = reel.querySelector('.card');
  const styles = getComputedStyle(reel);
  const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
  const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : reel.clientWidth / 4;
  const distance = 3 * (cardWidth + gap);
  const maxScrollLeft = Math.max(reel.scrollWidth - reel.clientWidth, 0);
  const step = direction === 'right' ? distance : -distance;
  const target = reel.scrollLeft + step;
  const nextLeft = direction === 'right' ? Math.min(target, maxScrollLeft) : Math.max(target, 0);
  reel.scrollTo({ left: nextLeft, behavior: 'smooth' });
  requestAnimationFrame(() => updateNavigationVisibility());
  setTimeout(() => updateNavigationVisibility(), 350);
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
  scroll-behavior: smooth;
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
  transition: background-color 0.2s ease, transform 0.2s ease;

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
