<template>
  <div class="app-window app-page__wrapper">
    <div class="app-window__title app-page__wrapper">
      <div class="app-page__content">
        About Us
      </div>
    </div>
    <NuxtLink to="/" class="app-window__close-button"></NuxtLink>
    <div class="app-page__content app-page__padding">
      <div class="app-window__logo app-window__logo--center">
        <a href="https://www.bfna.org/" target="_blank" class="router-link-exact-active router-link-active"><img src="../assets/bertelsmann-logo.png" alt="Bertelsman Foundation" class="logo"></a>
        <NuxtLink to="/"><img alt="Bertelsman Foundation Documentaries" src="../assets/bfna-documentaries-logo.png" class="logo" /></NuxtLink>
      </div>
      <section class="about-us-view__text flex columns">
        <div class="column">
          <p>
            Why documentary films? The Bertelsmann Foundation believes in the power of film to bring the critical stories of our complicated times to life. The potential of the documentary medium extends far beyond offering a convenient replacement for the written word. As a think tank, we try to present research and data in new and innovative ways to a wider audience. In the information age rife with opinion and fake news, our cinematic approach values honesty and insight. Our films do not project a specific agenda, but rather offer candid perspectives that allow the viewer to draw their own conclusions.
          </p>
          <p>
            Bertelsmann Foundation documentaries focus on governance, economics, elections, social issues, the digital revolution, and most importantly, where these issues intersect.
          </p>
        </div>
      </section>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.logo {
  max-width: 350px;
  margin: 0 30px;
}

.about-us-view {
  &__title {
    font-size: 2em;
    font-weight: 700;
    letter-spacing: 2.92px;
    line-height: 50px;
    text-transform: uppercase;
    padding: 32px 0;

    .highlight {
      color: $colors-green;
      letter-spacing: 3px;
    }
  }

  &__text {
    font-weight: 500;
    line-height: 30px;
  }

  &__podcast-icon {
    display: inline-block;

    & + & {
      margin-left: 16px;
    }
  }
}
</style>

<script>
import utils from "~/composables/utils";

export default {
  name: 'aboutUsView',
  metaInfo() {
    return {
      title: "BFNA Documentaries",
      meta: [
        {
          vmid: "description",
          name: "description",
          content: utils.getDefaultDescription(),
        },
        {
          vmid: "og:title",
          property: "og:title",
          content: utils.getDefaultTitle(),
        },
        {
          vmid: "og:description",
          property: "og:description",
          content: utils.getDefaultDescription(),
        },
      ],
    };
  },
  mounted () {
    this.$store.commit('setHomepageVideoEffect', false)
    this.$store.commit('setNavigation', true)
  }
}
</script>
