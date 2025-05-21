import { VimeoPlayer } from 'vue3-vimeo-player'
import '@vimeo/player/dist/player.esm'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('Vimeo-Player', VimeoPlayer)
})
