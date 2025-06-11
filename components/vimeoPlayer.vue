<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Player from '@vimeo/player'
import utils from '~/composables/utils';

const props = defineProps({
  vimeoUrl: {
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

const vimeoId = utils.getVideoIdFromVimeoUrl(props.vimeoUrl);


const playerContainer = ref<HTMLElement | null>(null)
const player = ref<Player | null>(null)

onMounted(() => {
  if (playerContainer.value) {
    player.value = new Player(playerContainer.value, {
      id: vimeoId,
      muted: true,
      autoplay: true,
      controls: false,
      responsive: true,
      loop: true,
    })

    const isLooping = true;

    // Wait for the player to be ready before seeking and playing
    player.value.on('loaded', async () => {
      console.log('Vimeo player loaded');
      try {
        // await player.value?.setCurrentTime(30);
        await player.value?.play();
      } catch (error) {
        console.error('Error during initial seek/play:', error);
      }
    });

    player.value.on('timeupdate', async (data) => {
      const { seconds } = data;
      console.log('Current time:', seconds);
      if (seconds >= 45 && isLooping) {
        try {
          await player.value?.setCurrentTime(30);
          await player.value?.play();
        } catch (error) {
          console.error('Error during loop:', error);
        }
      }
    });
  }
})

onUnmounted(() => {
  if (player.value) {
    player.value.unload();
    player.value = null;
  }
});


</script>

<template>
  <div ref="playerContainer"></div>
</template>