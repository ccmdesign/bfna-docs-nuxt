<template>
  <div class="large-navigation-bar" :class="{ hasMenu }">
    <div class="large-navigation-bar__button-wrapper" @click="toggleMenu">
      <div class="large-navigation-bar__button material-symbols-outlined">sort</div>
    </div>
    <ul class="large-navigation-bar__menu">
      <li><a href="https://www.bfna.org">Visit Our Homepage</a></li>
      <li><NuxtLink to="/about">About</NuxtLink></li>
    </ul>
  </div>
</template>

<style lang="scss">
@use "sass:color";
.large-navigation-bar {
  padding: 0 170px;
  z-index: 999;
  position: fixed;
  display: flex;
  flex-direction: row;
  width: calc(100% - 340px);
  height: 60px;
  background-color: rgba(0, 0, 0, 0.4);
  top: 0;
  left: 0;
  transition: transform 0.33s ease-in-out;
  border-right: solid 1px grey;
  backdrop-filter: blur(3px);

  &.hasMenu {
    transform: translateY(-100%);
  }

  &__button {
    @extend .material-icons !optional;
    width: 60px;
    height: 60px;
    text-align: center;
    line-height: 60px;
    cursor: pointer;
    user-select: none;
    transition: background-color 0.13s ease-in-out;
    transform: translateX(-20px);

      &:hover {
        background-color: color.adjust(#08415c, $lightness: 5%);
      }

    &-wrapper {
      flex: 0;
    }
  }

  &__menu {
    flex: 1;
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    width: max-content;
    margin: 0;
    padding: 0;

    li {
      padding: 16px 32px;
      display: inline-block;
      align-self: center;
      cursor: pointer;
      font-weight: bold;
      letter-spacing: 1.48px;
      text-transform: uppercase;
      transition: background-color 0.13s ease-in-out;
      pointer-events: all;

      &:hover {
        background-color: rgba(0, 0, 0, 0.4);
      }

      & > a {
        color: inherit;
        text-decoration: none;

        &:hover {
          text-decoration: none;
        }
      }
    }
  }
}
</style>

<script setup>
import { useVideoStore } from '~/stores/video';
import { storeToRefs } from 'pinia';

const videoStore = useVideoStore();
const { menuVisibility } = storeToRefs(videoStore);

const hasMenu = computed(() => menuVisibility.value);

function toggleMenu() {
  videoStore.setMenuVisibility(!hasMenu.value);
}
</script>
