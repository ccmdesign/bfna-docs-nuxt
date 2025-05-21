// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxt/content', '@nuxt/eslint', '@nuxt/test-utils', '@pinia/nuxt'],
  runtimeConfig: {
    public: {
      contentfulSpace: process.env.CONTENTFUL_SPACE_ID || '',
      contentfulToken: process.env.CONTENTFUL_ACCESS_TOKEN || ''
    }
  },
  app: {
    head: {
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },],
      link: [
        // google icons
        { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" },
      ],
      script: [],
    }
  },
  css: [
    './assets/scss/main.scss'
  ],
  build: {
    transpile: ['vue-carousel'],
  },
  vite: {
    optimizeDeps: {
      exclude: ['vue-carousel']
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "@/assets/scss/_mixins.scss" as *;
            @use "@/assets/scss/_colors.scss" as *;
          `
        }
      }
    }
  },
  plugins: [
    { src: '~/plugins/youtubePlayer.client.ts', mode: 'client' },
    { src: '~/plugins/vimeoPlayer.client.ts', mode: 'client' },
  ],
  ssr: false,
  experimental: {
    clientFallback: true
  }
})
