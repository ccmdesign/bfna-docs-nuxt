<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Player from '@vimeo/player'

const props = defineProps({
  videoId: {
    type: String,
    required: true
  },
  width: {
    type: Number,
    default: 640
  },
  height: {
    type: Number,
    default: 360
  }
})

const playerContainer = ref<HTMLElement | null>(null)
const player = ref<Player | null>(null)

onMounted(() => {
  if (playerContainer.value) {
    player.value = new Player(playerContainer.value, {
      id: props.videoId,
      width: props.width,
      height: props.height,
      autoplay: true,
      muted: true,
    })

    player.value.on('play', () => {
      console.log('Video is playing')
    })
  }
})
</script>

<template>
  <div ref="playerContainer"></div>
</template>