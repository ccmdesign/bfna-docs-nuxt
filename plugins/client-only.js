import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  if (process.client) {
    // Import and use components that rely on browser APIs only on the client side
    import('vue-carousel').then((module) => {
      const VueCarousel = module.default
      nuxtApp.vueApp.use(VueCarousel)
    })
  }
}) 