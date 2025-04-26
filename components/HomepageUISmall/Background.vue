<template>
  <div
    class="homepage__slider__background--large"
    :style="{ backgroundImage }"
  ></div>
</template>

<!--
<style lang="scss">
.homepage__slider__background--large {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #000000;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center center;
  opacity: 0.67;
}
</style>
-->

<script>
import utils from "~/composables/utils";

export default {
  data() {
    return {
      backgroundImage: `url('${this.imageUrl}')`,
    };
  },
  props: {
    imageUrl: {
      type: String,
      required: true,
    },
  },
};
</script>
