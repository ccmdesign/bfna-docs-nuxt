<template>
  <slide class="homepage__slider__slide">
    <background :imageUrl="video.backgroundImage" />
  </slide>
</template>

<style lang="scss">
.homepage__slider__slide {
  width: 100%;
  height: 100vh;
}
</style>

<script>
import { Slide } from "vue-carousel";
import Background from "@/components/HomepageUILarge/Background";

export default {
  components: { Slide, Background },
  props: {
    video: {
      type: Object,
      required: true,
    },
  },
};
</script>
