<template>
  <div class="homepage__slider__slide">
    <background :imageUrl="video.backgroundImage" />
  </div>
</template>

<style lang="scss">
.homepage__slider__slide {
  width: 100%;
  height: 100vh;
}
</style>

<script>
import Background from "@/components/HomepageUILarge/Background";

export default {
  components: { Background },
  props: {
    video: {
      type: Object,
      required: true,
    },
  },
};
</script>
