<template>
  <div class="doc-hero-extra">
    <slot>
      <docs-awards v-if="currentVideo.awards.length" />
    </slot>
  </div>
</template>

<script setup>
import { useVideoStore } from '~/stores/video';

const { currentVideo } = useVideoStore();

</script>

<style lang="scss" scoped>

</style>