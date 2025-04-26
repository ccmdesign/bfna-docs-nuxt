<template>
  <div
    class="menu-large"
    :class="{ hidden: !hasMenu }"
    @click="closeMenu(true, $event)"
  >
    <div class="menu-large__content">
      <div class="menu-large__close" @click="closeMenu(false, $event)">
        close
      </div>

      <section class="menu-large__col">
        <nav class="menu-large__nav menu-large--updates">
          <h2 class="menu-large__heading">Updates</h2>
          <a
            href="https://www.bfna.org/updates/index.html#publications"
            class="menu-large__item"
            >Publications</a
          ><br />
          <a
            href="https://www.bfna.org/updates/index.html#infographics"
            class="menu-large__item"
            >Infographics</a
          ><br />
          <a
            href="https://www.bfna.org/updates/index.html#videos"
            class="menu-large__item"
            >Videos</a
          ><br />
        </nav>

        <nav class="menu-large__nav menu-large--about">
          <h2 class="menu-large__heading">The Foundation</h2>
          <a href="https://www.bfna.org/about" class="menu-large__item"
            >About the Foundation</a
          ><br />
          <a href="https://www.bfna.org/team" class="menu-large__item"
            >Board of Directors | Team</a
          ><br />
          <a
            href="https://www.bfna.org/bertelsmann-stiftung"
            class="menu-large__item"
            >Bertelsmann Stiftung</a
          ><br />
          <a
            href="mailto: info@bfna.org"
            target="_blank"
            class="menu-large__item"
            >Contact</a
          ><br />
          <a href="https://www.bfna.org/privacy-policy" class="menu-large__item"
            >Privacy Policy</a
          >
        </nav>
      </section>

      <section class="menu-large__col menu-large--right-col">
        <nav class="menu-large__nav menu-large--topics">
          <h2 class="menu-large__heading">Topics</h2>
          <a href="https://www.bfna.org/democracy" class="menu-large__item"
            >Democracy</a
          ><br />
          <a href="https://www.bfna.org/future-leadership/" class="menu-large__item"
            >Future Leadership</a
          ><br />
          <a
            href="https://www.bfna.org/digital-world/"
            class="menu-large__item"
            >Digital World</a
          ><br />
          <a
            href="https://www.bfna.org/politics-society"
            class="menu-large__item"
            >Politics & Society</a
          ><br />
        </nav>

        <nav class="menu-large__nav menu-large--archive">
          <!--<a href="/" class="menu-large__item">BFNA Documentaries</a><br />-->
        </nav>
      </section>
    </div>
  </div>
</template>

<!--
<style lang="scss" scoped>
.menu-large {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 200;
  overflow: hidden;

  &.hidden {
    pointer-events: none;
    z-index: 10;

    .menu-large__content {
      transform: translateX(-100%);
    }
  }

  &__close {
    @extend .material-icons !optional;
    position: absolute;
    top: 2rem;
    right: 2rem;
    text-align: center;
    cursor: pointer;
    user-select: none;
    transition: background-color 0.13s ease-in-out;
    font-size: 2rem;
  }

  &__content {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    bottom: 0;
    padding: 90px 0;
    text-align: right;
    background-color: rgba(8, 67, 94, 0.95);
    transition: transform 0.33s ease-in-out;
    z-index: 10;
    padding: 6rem;
    display: flex;
  }

  &__col {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  &--updates {
    flex: 1;
    text-align: left;
  }

  &--about {
    flex: 0;
    text-align: left;
  }

  &--topics {
    flex: 1;
  }

  &__heading {
    color: #ffffff;
    font-weight: 600;
    padding: 0 1rem;
    font-size: 1.6rem;
  }

  &__item {
    display: inline-block;
    color: #ffffff;
    text-decoration: none;
    font-weight: 300;
    padding: 0 1rem 0.3rem;
    cursor: pointer;
    font-size: 1.3rem;

    &:hover {
      background-color: rgba(255, 255, 255, 0.05);
      color: inherit;
      text-decoration: none;
    }
  }
}
</style>
-->

<script>
import { useVideoStore } from '~/stores/video';
import { mapState } from 'pinia';

export default {
  computed: {
    ...mapState(useVideoStore, ['menuVisibility']),
    hasMenu() {
      return this.menuVisibility;
    },
  },
  methods: {
    setMenuVisibility(menuVisibility) {
      const videoStore = useVideoStore();
      videoStore.setMenuVisibility(menuVisibility);
    },
    closeMenu(ifBackground, event) {
      if (ifBackground && !event.target.classList.contains("menu-large")) {
        return;
      }
      this.setMenuVisibility(false);
    },
  },
};
</script>
