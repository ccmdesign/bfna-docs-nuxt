<template>
  <div
    class="homepage__slider__background--large"
    :style="{ backgroundImage }"
  ></div>
</template>

<style lang="scss">
.homepage__slider__background--large {
  position: fixed;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #000000;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: 50%;
  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(17, 24, 41, 0.65);
  }
}
</style>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  imageUrl: {
    type: String,
    required: true,
  },
});

const backgroundImage = computed(() => `url('${props.imageUrl}')`);
</script>
