<template>
  <div class="navigation-bar">
    <NuxtLink to="/" class="navigation-bar__logo">
      <img src="/assets/bfna-documentaries-logo.png" alt="BFNA Documentaries" />
    </NuxtLink>
    <div class="menu-trigger" @click="toggleMenu">
      <div class="menu-trigger__line"></div>
      <div class="menu-trigger__line"></div>
      <div class="menu-trigger__line"></div>
    </div>
  </div>
</template>

<!--
<style lang="scss" scoped>
.navigation-bar {
  position: fixed;
  display: flex;
  width: 100%;
  height: 55px;
  background-color: #000000;
  text-align: center;
  bottom: -16px;
  left: 0;
  list-style: none;
  padding: 0;
  transition: transform 0.13s ease-in-out;
  transform: translateY(100%);
  z-index: 1000;
  user-select: none;

  &.show {
    transform: none;
  }

  &__label {
    font-size: 12px;
    font-weight: 500;
    line-height: 12px;
    text-transform: uppercase;
    margin: 0;
  }

  &__item {
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
    align-items: center;
    justify-content: center;
    background-color: #08415c;

    &::before {
      position: absolute;
      content: "";
      width: 64px;
      height: 4px;
      background-color: #08415c;
      bottom: 0;
      left: calc(50% - 32px);
      transition: transform 0.13s ease-in-out;
      transform-origin: center;
      transform: scaleX(0);
    }

    &.active {
      &::before {
        transform: none;
      }
    }
  }

  &__icon {
    @extend .material-icons !optional;
  }
}
</style>
-->

<script>
import { useRouter } from 'vue-router'
import { useVideoStore } from '~/stores/video'
import { mapState } from 'pinia'

export default {
  setup() {
    const router = useRouter()
    return {
      router
    }
  },
  data() {
    return {
      currentRoute: this.router.currentRoute.value.name,
    };
  },
  computed: {
    ...mapState(useVideoStore, ['navigation', 'menuVisibility']),
    hasNavigation() {
      return this.navigation;
    },
    hasMenu() {
      return this.menuVisibility;
    },
  },
  watch: {
    '$route'(to, from) {
      this.currentRoute = to.name;
    },
  },
  methods: {
    isCurrentRoute(routeName) {
      return this.currentRoute === routeName;
    },
    toggleMenu() {
      const videoStore = useVideoStore();
      videoStore.setMenuVisibility(!this.hasMenu);
    },
  },
};
</script>
