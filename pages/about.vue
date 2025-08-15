<script setup>
import utils from "~/composables/utils";
import { useVideoStore } from '~/stores/video';

definePageMeta({
  layout: 'about',
});

useHead({
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
});

const videoStore = useVideoStore();
videoStore.setHomepageVideoEffect(false);
videoStore.setNavigation(true);

</script>

<template>
  <div class="app-window app-page__wrapper subgrid">
    <div class="about-page__header">
      <a href="https://www.bfna.org/" target="_blank" class="router-link-exact-active router-link-active"><img src="/assets/bertelsmann-logo.png" alt="Bertelsman Foundation" class="logo"></a>
      <img class="hide-on-mobile" src="/assets/samuel-george.webp" alt="Dr. Samuel George picture" />
    </div>
    <section class="about-us-view__text flex columns">
      <div class="row">
        <p class="font-size:-1 font-weight:700">About the Foundation</p>
        <p>
          Why documentary films? The Bertelsmann Foundation believes in the power of film to bring the critical stories of our complicated times to life. The potential of the documentary medium extends far beyond offering a convenient replacement for the written word. As a think tank, we try to present research and data in new and innovative ways to a wider audience. In the information age rife with opinion and fake news, our cinematic approach values honesty and insight. Our films do not project a specific agenda, but rather offer candid perspectives that allow the viewer to draw their own conclusions.
        </p>
        <p>
          Bertelsmann Foundation documentaries focus on governance, economics, elections, social issues, the digital revolution, and most importantly, where these issues intersect. Bertelsmann Foundation Documentaries have broadcast nationally on PBS, stream on platforms such as Kanopy, and have screened at leading film festivals, universities and institutions across the United States and Europe.
        </p>
      </div>
      <img class="hide-on-desktop" src="/assets/samuel-george.webp" alt="Dr. Samuel George picture" />
      <div class="row">
        <p class="font-size:-1 font-weight:700">Contact</p>
        <div class="row__group">
          <p class="font-size:2">Dr. Samuel George</p>
          <p class="font-style:italic">Director</p>
        </div>
        <div class="row__group ">
          <p class="font-style:italic">Bertelmann Foundation Documentaries</p>
          <a href="mailto:samuel.george@bfna.org">samuel.george@bfna.org</a>
        </div>
      </div>
    </section>
  </div>
</template>


<style lang="scss" scoped>
.app-window {
  grid-column: content-start / content-end;
  display: grid;
  padding-top: var(--space-xl);
  @media (max-width: 768px) {
    gap: var(--space-xl);
  }
}

.logo {
  max-width: 350px;
  @media (max-width: 768px) {
    max-width: 175px;
  }
}

.about-page__header {
  grid-column: 1 / 4;
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;
  @media (max-width: 768px) {
    grid-column: content-start / content-end;
  }
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
      color: var(--primary-color);
      letter-spacing: 3px;
    }
  }

  &__text {
    font-weight: 500;
    line-height: 30px;
    grid-column: 5 / content-end;
    display: flex;
    flex-flow: column nowrap;
    justify-content: space-between;
    gap: var(--space-xl);
    @media (max-width: 768px) {
      grid-column: content-start / content-end;
    }
  }

  &__podcast-icon {
    display: inline-block;

    & + & {
      margin-left: 16px;
    }
  }
}

.row {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.row__group {
  display: flex;
  flex-direction: column;
  gap: var(--space-3xs);
  p {
    margin: 0;
  }
}

</style>
