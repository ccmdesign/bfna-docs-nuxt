import { promises as fs } from 'fs';
import path from 'path';

const title = 'BFNA Documentaries';
const description = 'Documentaries produced by the Bertelsmann Foundation, showcasing various social and cultural topics.';
const OG = '/assets/og_img_bfna.jpg';
const claritySnippet = `!function(c,l,a,r,i,t,y){function sync(){(new Image).src="https://c.clarity.ms/c.gif"}"complete"==document.readyState?sync():window.addEventListener("load",sync);a[c]("metadata",(function(){a[c]("set","C_IS","0")}),!1,!0);if(a[c].v||a[c].t)return a[c]("event",c,"dup."+i.projectId);a[c].t=!0,(t=l.createElement(r)).async=!0,t.src="https://scripts.clarity.ms/0.8.41/clarity.js",(y=l.getElementsByTagName(r)[0]).parentNode.insertBefore(t,y),a[c]("start",i),a[c].q.unshift(a[c].q.pop()),a[c]("set","C_IS","0")}("clarity",document,window,"script",{"projectId":"u2x19jqghw","upload":"https://i.clarity.ms/collect","expire":365,"cookies":["_uetmsclkid","_uetvid"],"track":true,"content":true,"report":"https://report.clarity.ms/eus2-tag","keep":["msclkid"],"dob":2148});`

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
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'https://bfna.simplyas.com',
    name: title,
  },
  modules: ['@nuxt/content', '@nuxt/eslint', '@nuxt/test-utils', '@pinia/nuxt', '@nuxtjs/seo', 'nuxt-og-image', '@weareheavy/nuxt-cookie-consent'],
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
        // display=block: icons are ligature text, so a fallback-font paint would show
        // the raw glyph name and reflow on swap (BF-122).
        { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined&display=block" },
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
    { src: '~/plugins/youtubePlayer.client.ts', mode: 'client' }
  ],
  cookieConsent: {
    provider: 'cookieinformation',
    init: false,
    dev: true,
    scripts: {
      statistic: [
        {
          children: claritySnippet,
          type: 'text/javascript'
        }
      ]
    }
  },
  ssr: true,
  experimental: {
    clientFallback: true
  },
  components: [
    { path: '~/components', pathPrefix: false }
  ],
})
