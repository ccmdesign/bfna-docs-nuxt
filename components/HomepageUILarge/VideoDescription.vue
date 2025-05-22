<script setup>
import { ref, computed } from 'vue';
import HomeHeader from "./HomeHeader.vue";
import utils from "~/composables/utils";
import { useRouter } from 'vue-router';
import { useVideoStore } from '~/stores/video';
import { storeToRefs } from 'pinia';

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  }
});

const isOpened = ref(props.open);
const router = useRouter();
const videoStore = useVideoStore();
const hasVideos = computed(() => videoStore.hasVideos);
const currentVideoObj = computed(() => hasVideos.value
  ? videoStore.getCurrentVideoBasedOnSlug
  : videoStore.emptyEpisode
);

const workstream = computed(() => `video-workstream--${currentVideoObj.value.workstream || 'democracy'}`);

const emit = defineEmits(['hideList']);

function openVideo(video) {
  let videoId = '';
  const source = video.source;
  
  if (source === 'youtube') {
    videoId = utils.getVideoIdFromYoutubeUrl(video.videoUrl);
  } else if (source === 'vimeo') {
    videoId = utils.getVideoIdFromVimeoUrl(video.videoUrl);
  }
  
  if (!videoId) {
    if (import.meta.client) {
      alert(`Couldn't play video:\nvideo ID not found in "${video.videoUrl}".`);
    }
    return;
  }
  
  videoStore.setHomepageVideoEffect(true);
  setTimeout(() => {
    router.push({ name: "watch", params: { id: videoId, source } });
  }, 330);
}

function moreInfo() {
  toTop();
  isOpened.value = true;
  emit('hideList', false);
  setTimeout(() => {
    router.push({
      name: `videoDescription`,
      path:':slug',
      params: { slug: utils.slugify(currentVideoObj.value.title) }
    });
  }, 100);
}

function returnButton() {
  isOpened.value = false;
  if (import.meta.client) {
    window.scroll({
      top: 0, 
      left: 0, 
      behavior: 'smooth'
    });
  }
  setTimeout(() => {
    router.replace('/');
  }, 100);
}

function toTop() {
  if (import.meta.client) {
    window.scroll({
      top: 0, 
      left: 0, 
      behavior: 'smooth'
    });
  }
}

function getUIType() {
  if (import.meta.client) {
    return document.documentElement.clientWidth >= 768 ? 'large' : 'small';
  }
  return 'large'; // Default for SSR
}
</script>

<template>
  <div class="full_content">
    <HomeHeader />
    <div class="video__description" :class="workstream">
      <span class="video__workstream__tag">
        {{ currentVideoObj.workstream }}
      </span>
      <div class="video__heading">
        <h2 class="video__title">{{ currentVideoObj.title }}</h2>
        <p class="video__subtitle">{{ currentVideoObj.subtitle }}</p>
        <p class="video__subtitle" v-if="currentVideoObj.by">By {{ currentVideoObj.by }}</p>
      </div>
      <div class="video__excerpt" v-bind:class="{ opened : isOpened }">
        <p>{{ currentVideoObj.description }}</p>
      </div>
      <div class="award-list award-list--mobile" v-if="getUIType() === 'small'">
        <div class="award" v-for="award in currentVideoObj.awards" :key="award.id">
          <div class="award__info">
            <img src="/assets/award_icon.png" alt="Icon badge" class="award__icon">
            <span class="award__separator"></span>
            <div class="award__data">
              <p class="award__title">{{ award.title }}</p>
              <p class="award__text">{{ award.year }}<span v-if="award.institution"> - {{ award.institution }}</span></p>
            </div>
          </div>
        </div>
      </div>
      <button class="video__play" @click="openVideo(currentVideoObj)">play</button>
      <button class="video__info video__info--borderless" @click="returnButton" v-if="isOpened && getUIType() === 'large'">Return</button>
      <button class="video__info" @click="moreInfo" v-else-if="getUIType() === 'large'">More info</button>
    </div>
  </div>
</template>

<style lang="scss">
@use "sass:color";
.full_content {
  z-index: 1;
  //position: absolute;
  // width: 100%;
  max-height: 100%;
  top: 0;
  left: 0;
  overflow: hidden;
  background-color: rgba(17, 24, 41, 0.65);
  padding: 35px 170px 0;
  @media (max-width:768px) {
    background: linear-gradient(180deg, rgba(17, 24, 41, 0) 0%, rgba(17, 24, 41, 0) 60vh, rgba(0,8,12,1) 80vh, rgba(0,8,12,1) 100%);
    position: relative;
  }
  
}

.video {
  &__description {
    max-width: 70ch;
    margin-bottom: 64px;
    margin-top: 5vh;
    position: relative;
    @media (max-width:768px) {
      align-items: flex-start;
      max-width: 100%;
      margin-top: 55px;
    }
  }
  &__heading {
    padding-bottom: 2vh;
  }
  &__title {
    font-size: 6vh;
    font-weight: 700;
    margin-bottom: 0;
    letter-spacing: -0.05em;
  }
  &__subtitle {
    opacity: 1;
    margin-bottom: 8px;
  }
  &__excerpt {
    margin-bottom: 6vh;
    p {
      font-size: 1em;
      line-height: 1.62em;
      max-height: 10vh;
      transition: all 0.8s ease-out;
      overflow: hidden;
      background: linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 60%, rgba(255,255,255,0) 100%);
      color: transparent;
      background-clip: text;
      /*display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;  
      overflow: hidden;*/
    }
    &.opened {
      p {
        max-height: 50vh;
        background-color: #FFF;
      }
    }
  }
  &__workstream__tag {
    display: inline-block;
    padding: 2px 24px 2px;
    font-weight: 600;
    font-size: 0.65rem;
    text-transform: uppercase;
    background-color: green;
    color: #ffffff;
  }
  &__play,
  &__info {
    font-weight: bold;
    font-size: 1.5em;
    width: 200px;
    height: 57px;
    line-height: 57px;
    color: #ffffff;
    text-transform: uppercase;
    cursor: pointer;
    box-sizing: content-box;
    border-radius: 2px;
    &:hover, &:active, &:visited, &:focus {
      text-decoration: none;
      outline: none;
    }
  }
  &__play {
    border: none;
    user-select: none;
    line-height: 57px;
    border: 1.5px solid #fc8b00;
    @media (max-width:768px) {
      width: 100%;
      box-sizing: border-box;  
      padding: 0;
    }
      &:hover {
        background-color: color.adjust(#fc8b00, $lightness: 9%);
        border-color: color.adjust(#fc8b00, $lightness: 9%);
      }

    &:disabled {
      opacity: 0.33;
      pointer-events: none;
    }
  }
  &__info {
    border: 1.5px solid #FFF;
    background-color: transparent;
    user-select: none;
    line-height: 57px;
    transition: all 0.2s ease-out;
    margin-left: 24px;
    &:hover {
      background-color: #FFF;
      color: #000;
    }
    &.video__info--borderless {
      border-color: transparent;
      &:hover {
        background-color: transparent;
        font-size: 1.6em;
        color: #FFF;
      }
    }
  }
}
.video-workstream--democracy {
  & > .video__workstream__tag,
  & > .video__play {
    background-color: #4f8d71;
    border-color: #4f8d71;
  }
  & > .video__play:hover {
    background-color: color.adjust(#4f8d71, $lightness: 9%);
    border-color: color.adjust(#4f8d71, $lightness: 9%);
  }
}

.video-workstream--politics-society {
  & > .video__workstream__tag,
  & > .video__play {
    background-color: #fc8b00;
    border-color: #fc8b00;
  }
  & > .video__play:hover {
    background-color: color.adjust(#fc8b00, $lightness: 9%);
    border-color: color.adjust(#fc8b00, $lightness: 9%);
  }
}

.video-workstream--future-of-work {
  & > .video__workstream__tag,
  & > .video__play {
    background-color: #c73540;
    border-color: #c73540;
  }
  & > .video__play:hover {
    background-color: color.adjust(#c73540, $lightness: 9%);
    border-color: color.adjust(#c73540, $lightness: 9%);
  }
}

.video-workstream--digital-economy {
  & > .video__workstream__tag,
  & > .video__play {
    background-color: #631764;
    border-color: #631764;
  }
  & > .video__play:hover {
    background-color: color.adjust(#631764, $lightness: 9%);
    border-color: color.adjust(#631764, $lightness: 9%);
  }
}
.award-list--mobile {
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-end;

  .award {
    margin-bottom: 10px;
    width: 100%;
    background: #000;
    border-radius: 2px;
    border: 1px solid #282F3A;
    &:last-child {
      margin-bottom: 24px;
    }
  }

    .award__info {
      flex-grow: 1;
      display: flex;
      flex-flow: row nowrap;
      padding: 8px 16px;
      background: none;
    }

    .award__icon {
      margin: auto 0;
      width: 32px;
      height: 32px;
    }

    .award__separator {
      width: 1px;
      margin: 0 16px;
      background: #464646;
    }
    .award__data {
      flex-grow: 1;
    }

    .award__title {
      font-size: 1.125em;
      line-height: 1em;
      color: #FCC500;
      font-weight: 400;
      letter-spacing: 0.02em;
      margin: 0;
    }

    .award__text {
      font-size: 0.875em;
      font-weight: 400;
      line-height: 1.62em;
      color: #FFF;
      margin: 0;
    }
}
</style>
