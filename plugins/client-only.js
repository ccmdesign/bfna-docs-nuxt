import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  if (process.client) {
    // Import and use components that rely on browser APIs only on the client side
    try {
      import('vue-carousel').then((module) => {
        const VueCarousel = module.default
        if (VueCarousel && nuxtApp.vueApp.use) {
          nuxtApp.vueApp.use(VueCarousel)
        }
      }).catch(error => {
        console.error('Error importing vue-carousel:', error)
      })
    } catch (error) {
      console.error('Error in client-only plugin:', error)
    }
  }
}) 