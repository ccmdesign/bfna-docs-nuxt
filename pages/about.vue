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
    <div class="about-us-view__text flex columns">
      <div class="row">
        <h2 class="font-size:2 font-weight:700">About Bertelsmann Foundation Documentaries</h2>
        <p>The Bertelsmann Foundation believes in the power of film to bring the critical stories of our complicated times to life. The potential of the documentary medium extends far beyond serving as a convenient replacement for the written word. We strive to present research in new and innovative ways to a wider audience. In an information age rife with opinion and fake news, our cinematic approach values honesty and insight. Our films do not project a specific agenda, but rather offer candid perspectives that allow the viewer to draw their own conclusions.</p>
        <p>Bertelsmann Foundation documentaries focus on governance, economics, elections, social issues, the digital revolution, and—most importantly—where these issues intersect. Our films have broadcast nationally on PBS, streamed on leading online platforms, and screened at leading film festivals, universities, and institutions across the United States and Europe. As a non-profit institution, our films are always free to watch and share.
        </p>
      </div>

      <div class="about-page__header">
        <a href="https://www.bfna.org/" target="_blank" class="router-link-exact-active router-link-active"><img src="/assets/bertelsmann-logo.png" alt="Bertelsman Foundation" class="logo"></a>
        <a href="https://www.bfna.org/" target="_blank" class="router-link-exact-active router-link-active"><img src="/assets/bfna-documentaries-logo.png" alt="Bertelsman Foundation Documentaries" class="logo"></a>
      </div>
    </div>

    <div class="about-page__profile">
      <div class="about-page__profile-image">
        <img src="/assets/samuel-george.webp" alt="Dr. Samuel George picture" />
      </div>
      <div class="about-us-view__text_contact flex columns">
        <div class="row">
          <p class="font-size:-1 font-weight:700">Contact</p>
          <div class="row__group">
            <p class="font-size:2">Dr. Samuel George</p>
            <p class="font-style:italic">Director</p>
          </div>
          <div class="row__group ">
            <p>Bertelsmann Foundation Documentaries</p>
            <a href="mailto:samuel.george@bfna.org">samuel.george@bfna.org</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<style lang="scss" scoped>
.app-window {
  grid-column: content-start / content-end;
  display: grid;
  padding-top: var(--space-xl);
  row-gap: var(--space-xl);
  column-gap: var(--space-xl);
  grid-template-columns: minmax(0, 65%) minmax(0, 35%);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.about-page__profile {
  grid-column: 2 / 3;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-xl);

  &-image {
    width: 100%;
    max-width: 340px;

    img {
      display: block;
      width: 100%;
      height: auto;
    }
  }

  @media (max-width: 768px) {
    grid-column: 1 / -1;
    align-items: center;
    text-align: center;
  }
}

.logo {
  max-width: 220px;
  @media (max-width: 768px) {
    max-width: 140px;
  }
}

.about-page__header {
  grid-column: 5 / content-end;
  display: flex;
  gap: 4rem;
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
    grid-column: 1 / 2;
    display: flex;
    flex-flow: column nowrap;
    gap: var(--space-xl);
    @media (max-width: 768px) {
      grid-column: 1 / -1;
    }
  }

  &__text_contact {
    font-weight: 500;
    line-height: 30px;
    display: flex;
    flex-flow: column nowrap;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-xl);
    width: 100%;
    max-width: 340px;
    @media (max-width: 768px) {
      align-items: center;
      text-align: center;
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
  p:first-child {
    margin-top: 0;
  }
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
