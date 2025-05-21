import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(async (nuxtApp) => {
  if (import.meta.client) {
    try {
      // Only import these components on the client side
      const carouselModule = await import('vue-carousel')
      const Carousel = carouselModule.Carousel
      const Slide = carouselModule.Slide
      
      const scrollbarModule = await import('vue2-perfect-scrollbar')
      const PerfectScrollbar = scrollbarModule.PerfectScrollbar
      
      // Register them globally
      nuxtApp.vueApp.component('Carousel', Carousel)
      nuxtApp.vueApp.component('CarouselSlide', Slide)
      nuxtApp.vueApp.component('PerfectScrollbar', PerfectScrollbar)
    } catch (error) {
      console.error('Error registering client components:', error)
    }
  }
}) 