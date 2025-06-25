const title = 'Bertelsmann Foundation documentaries';
const description = 'Documentaries produced by the Bertelsmann Foundation, showcasing various social and cultural topics.';
const OG = '/assets/og_img_bfna.jpg';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxt/content', '@nuxt/eslint', '@nuxt/test-utils', '@pinia/nuxt', '@nuxtjs/seo', 'nuxt-og-image'],
  runtimeConfig: {
    public: {
      contentfulSpace: process.env.CONTENTFUL_SPACE_ID || '',
      contentfulToken: process.env.CONTENTFUL_ACCESS_TOKEN || ''
    }
  },
  app: {
    head: {
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { property: 'og:site_name',  content: title},
        { property: 'og:title',  content: title},
        { property: 'og:description',  content: description},
        { property: 'og:image',  content: OG},
        { property: 'og:image:alt',  content: `Image from ${title}`},
        { name: 'twitter:image',  content: OG},
        { name: 'twitter:image:alt',  content: `Image from ${title}`},
        { name: 'twitter:description', content: description }
      ],
      link: [
        // google icons
        { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" },
        { rel: 'icon', type: 'image/ico', href: '/assets/favicon.ico'}
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
  ssr: true,
  experimental: {
    clientFallback: true
  },
  components: [
    { path: '~/components', pathPrefix: false }
  ],
})