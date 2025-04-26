<template>
  <div class="test-page">
    <h1>Contentful Test</h1>
    
    <div v-if="loading">Loading...</div>
    
    <div v-else>
      <div v-if="error" class="error">
        <h2>Error:</h2>
        <pre>{{ error }}</pre>
      </div>
      
      <div v-else>
        <h2>Videos in store ({{ videoStore.videoList.length }}):</h2>
        <div v-for="(video, index) in videoStore.videoList" :key="index" class="video-item">
          <h3>{{ video.title }}</h3>
          <p>{{ video.description }}</p>
          <div><strong>Source:</strong> {{ video.source }}</div>
          <div><strong>URL:</strong> {{ video.videoUrl }}</div>
          <div><strong>Workstream:</strong> {{ video.workstream }}</div>
        </div>
      </div>
      
      <div class="contentful-direct">
        <h2>Direct Contentful Test:</h2>
        <button @click="testContentfulDirect">Test Direct Connection</button>
        
        <div v-if="directResults">
          <h3>Results:</h3>
          <pre>{{ JSON.stringify(directResults, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useVideoStore } from '~/stores/video'
import * as contentful from 'contentful'

const { $contentful } = useNuxtApp()
const videoStore = useVideoStore()
const loading = ref(true)
const error = ref(null)
const directResults = ref(null)

onMounted(async () => {
  try {
    await videoStore.fetchVideos()
    loading.value = false
  } catch (err) {
    error.value = err.message
    loading.value = false
  }
})

async function testContentfulDirect() {
  try {
    // Test direct connection to Contentful using the injected client
    const config = useRuntimeConfig()
    
    // Log config values for debugging
    console.log('Config values:', {
      spaceId: config.public.contentfulSpace,
      hasToken: !!config.public.contentfulToken
    })
    
    directResults.value = {
      config: {
        spaceId: config.public.contentfulSpace,
        hasToken: !!config.public.contentfulToken
      }
    }
    
    // Create a direct client
    const client = contentful.createClient({
      space: config.public.contentfulSpace,
      accessToken: config.public.contentfulToken
    })
    
    // Query for entry count
    const result = await client.getEntries({
      limit: 1
    })
    
    directResults.value = {
      ...directResults.value,
      totalEntries: result.total,
      firstItem: result.items[0] ? {
        id: result.items[0].sys.id,
        contentType: result.items[0].sys.contentType.sys.id,
        fields: Object.keys(result.items[0].fields)
      } : null
    }
  } catch (err) {
    directResults.value = {
      error: err.message,
      stack: err.stack
    }
  }
}
</script>

<style>
.test-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: sans-serif;
}

.error {
  background-color: #ffebee;
  border: 1px solid #f44336;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 4px;
}

.video-item {
  background-color: #f5f5f5;
  padding: 15px;
  margin-bottom: 15px;
  border-radius: 4px;
  color: #333;
}

.contentful-direct {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

button {
  background-color: #4f8d71;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background-color: #3d7a5f;
}

pre {
  background-color: #f5f5f5;
  padding: 15px;
  overflow: auto;
  border-radius: 4px;
  color: #333;
}
</style> 