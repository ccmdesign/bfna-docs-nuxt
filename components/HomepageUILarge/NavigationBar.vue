<template>
  <div class="large-navigation-bar" :class="{ hasMenu }">
    <div class="large-navigation-bar__button-wrapper" @click="toggleMenu">
      <div class="large-navigation-bar__button">sort</div>
    </div>
    <ul class="large-navigation-bar__menu">
      <li><a href="https://www.bfna.org">Visit Our Homepage</a></li>
      <li><NuxtLink to="/about">About</NuxtLink></li>
    </ul>
  </div>
</template>

<style lang="scss">
.large-navigation-bar {
  padding: 0 170px;
  z-index: 999;
  position: fixed;
  display: flex;
  flex-direction: row;
  width: 100%;
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
    @extend .material-icons;
    width: 60px;
    height: 60px;
    text-align: center;
    line-height: 60px;
    cursor: pointer;
    user-select: none;
    transition: background-color 0.13s ease-in-out;
    transform: translateX(-20px);

    &:hover {
      background-color: lighten(#08415c, 5);
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

    // transform-origin: left top;
    
    // margin-top: 60vh;
    

    // @media (min-width: 100em) {
    //   margin-top: 331px;
    // }

    li {
      padding: 16px 32px;
      display: inline-block;
      //transform-origin: 1px 0;
      //transform: rotate(-90deg);
      align-self: center;
      cursor: pointer;
      font-weight: bold;
      letter-spacing: 1.48px;
      text-transform: uppercase;
      transition: background-color 0.13s ease-in-out;
      pointer-events: all;

      @media (min-width: 100em) {
        // padding: 0 64px;
      }

      &:hover {
        background-color: rgba(0, 0, 0, 0.4);
      }

      // &:first-child {
      //   margin-right: 16px;
      // }

      // &:last-child {
      //   margin-left: 16px;
      // }

      & > a {
        color: inherit;

        &:hover {
          text-decoration: none;
        }
      }
    }
  }
}
</style>

<script>
export default {
  computed: {
    hasMenu() {
      return this.$store.state.menuVisibility;
    },
  },
  methods: {
    toggleMenu() {
      this.$store.commit("setMenuVisibility", !this.hasMenu);
    },
  },
};
</script>
