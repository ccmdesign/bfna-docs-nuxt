import Youtube from 'vue3-youtube'
export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.component('Youtube-Player', Youtube)
})