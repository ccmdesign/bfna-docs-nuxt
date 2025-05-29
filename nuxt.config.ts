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
    'public/css/styles.css'
  ],
  build: {
    transpile: ['vue-carousel'],
  },
  vite: {
    optimizeDeps: {
      exclude: ['vue-carousel']
    }
    // removed scss preprocessorOptions
  },
  plugins: [
    { src: '~/plugins/youtubePlayer.client.ts', mode: 'client' },
  ],
  ssr: false,
  experimental: {
    clientFallback: true
  },
  components: [
    { path: '~/components', pathPrefix: false }
  ],
})