import { promises as fs } from 'fs';
import path from 'path';

const title = 'BFNA Documentaries';
const description = 'Documentaries produced by the Bertelsmann Foundation, showcasing various social and cultural topics.';
const OG = '/assets/og_img_bfna.jpg';

const contentDir = path.resolve(__dirname, 'content/videos-slugs');
let videoRoutes: string[] = [];

try {
  const files = JSON.parse(await fs.readFile(path.join(contentDir, 'slugs.json'), 'utf-8'));
  videoRoutes = files.slugs.map((item: any) => `/${item}`);
} catch (e) {
  videoRoutes = [];
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxt/content', '@nuxt/eslint', '@nuxt/test-utils', '@pinia/nuxt', '@nuxtjs/seo', 'nuxt-og-image'],
  runtimeConfig: {
    public: {
      contentfulSpace: process.env.CONTENTFUL_SPACE_ID || '',
      contentfulToken: process.env.CONTENTFUL_ACCESS_TOKEN || '',
      gaMeasurementId: process.env.NUXT_PUBLIC_GA_MEASUREMENT_ID || 'G-L3GWV0YT4W'
    }
  },
  nitro: {
  prerender: {
    routes: videoRoutes
  }
},
  app: {
    head: {
      title,
      titleTemplate: '%s',
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: 'description', content: description },
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
    { src: '~/plugins/clarity.client.js', mode: 'client' },
  ],
  ssr: true,
  experimental: {
    clientFallback: true
  },
  components: [
    { path: '~/components', pathPrefix: false }
  ],
})
