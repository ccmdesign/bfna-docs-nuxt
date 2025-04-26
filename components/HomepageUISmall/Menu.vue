<template>
  <div
    class="menu-small"
    :class="{ hidden: !hasMenu }"
    @click="closeMenu(true, $event)"
  >
    <div class="menu-small__content" ref="menuContent">
      <section class="menu-small__col">
        <nav class="menu-small__nav menu-small--updates">
          <h2 class="menu-small__heading">Updates</h2>
          <a
            href="https://www.bfna.org/updates/index.html#publications"
            class="menu-small__item"
            >Publications</a
          ><br />
          <a
            href="https://www.bfna.org/updates/index.html#infographics"
            class="menu-small__item"
            >Infographics</a
          ><br />
          <a
            href="https://www.bfna.org/updates/index.html#videos"
            class="menu-small__item"
            >Videos</a
          ><br />
          <NuxtLink
            to="/about"
            class="menu-small__item">
            About
          </NuxtLink>
          <br />
        </nav>

        <nav class="menu-small__nav menu-small--about">
          <h2 class="menu-small__heading">The Foundation</h2>
          <a href="https://www.bfna.org/about" class="menu-small__item"
            >About the Foundation</a
          ><br />
          <a href="https://www.bfna.org/team" class="menu-small__item"
            >Board of Directors | Team</a
          ><br />
          <a
            href="https://www.bfna.org/bertelsmann-stiftung"
            class="menu-small__item"
            >Bertelsmann Stiftung</a
          ><br />
          <a
            href="mailto: info@bfna.org"
            target="_blank"
            class="menu-small__item"
            >Contact</a
          ><br />
          <a href="https://www.bfna.org/privacy-policy" class="menu-small__item"
            >Privacy Policy</a
          >
        </nav>
      </section>

      <section class="menu-small__col menu-small--right-col">
        <nav class="menu-small__nav menu-small--topics">
          <h2 class="menu-small__heading">Topics</h2>
          <a href="https://www.bfna.org/democracy" class="menu-small__item"
            >Democracy</a
          ><br />
          <a href="https://www.bfna.org/future-leadership/" class="menu-small__item"
            >Future Leadership</a
          ><br />
          <a
            href="https://www.bfna.org/digital-world/"
            class="menu-small__item"
            >Digital World</a
          ><br />
          <a
            href="https://www.bfna.org/politics-society"
            class="menu-small__item"
            >Politics & Society</a
          ><br />
        </nav>
      </section>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.menu-small {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 10;
  overflow: hidden;

  &__section {
    &-wrapper {
      color: #ffffff;
      font-size: 1em;
      padding: 20px 24px;
      text-align: center;

      @include media-breakpoint-small {
        padding: 20px 64px 20px 64px;
      }
    }

    &-title {
      color: #fc8b00;
      letter-spacing: 3.7px;
      line-height: 20px;
      text-transform: uppercase;
      user-select: none;
    }

    &-description {
      font-weight: 300;
      letter-spacing: 0.3px;
      user-select: none;
    }
  }

  &__nav { padding-top: 2rem; }
  &__nav a { color: #fff; }

  &.hidden {
    pointer-events: none;

    .menu-small__content {
      transform: translateY(100%);
    }
  }

  &__content {
    position: absolute;
    width: 100%;
    left: 0;
    bottom: 0;
    padding: 25px 0 128px 20px;
    background-color: rgba(8, 67, 94, 0.95);
    transition: transform 0.33s ease-in-out;
    height: 100%;

    &::after {
      position: fixed;
      content: "";
      top: 0;
      left: 0;
      width: 100%;
      height: 96px;
    }
  }

  &__list {
    list-style: none;
    padding: 0;
  }
}

.menu-small--archive {
  padding: 35px 0;
}
</style>

<script>
import utils from "../../utils";

export default {
  computed: {
    hasMenu() {
      return this.$store.state.menuVisibility;
    },
  },
  watch: {
    hasMenu(oldValue, newValue) {
      if (newValue) {
        this.scrollToBottom();
      }
    },
  },
  methods: {
    setMenuVisibility(menuVisibility) {
      this.$store.commit("setMenuVisibility", menuVisibility);
    },
    closeMenu(ifBackground, event) {
      if (ifBackground && !event.target.classList.contains("menu-small")) {
        return;
      }
      this.setMenuVisibility(false);
    },
    scrollToBottom() {
      this.$refs.menuContent.scrollTo(0, this.$refs.menuContent.scrollHeight);
    },
  },
  mounted() {
    this.scrollToBottom();
  },
};
</script>
