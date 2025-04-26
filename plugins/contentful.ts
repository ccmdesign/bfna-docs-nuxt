import { createClient } from 'vue-contentful'
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  
  // Use environment variables or fallback to empty strings
  // (will be replaced with real values in .env file)
  const client = createClient({
    space: config.public.contentfulSpace || '',
    accessToken: config.public.contentfulToken || '',
  })
  
  return {
    provide: {
      contentful: client
    }
  }
}) 