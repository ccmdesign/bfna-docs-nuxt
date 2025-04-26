import { defineStore } from 'pinia'
import * as contentful from 'contentful'

export interface Video {
  title: string
  description: string
  subtitle?: string
  videoUrl: string
  workstream?: string
  backgroundImage?: string
  source: 'youtube' | 'vimeo'
  tags?: string[]
  video_info?: {
    teaser_url?: string
    teaser_source?: 'youtube' | 'vimeo'
    thumb?: string
    screenshot?: string
    column_1_title?: string
    column_1_text?: string
    column_2_title?: string
    column_2_text?: string
    screenshot_extras?: Array<{ id: string, url: string, title: string }>
  }
  awards?: Array<{
    id: string
    title: string
    year: string
    institution?: string
  }>
  screenings?: Array<{
    id: string
    dateStart: string
    dateEnd: string
    estabilishment: string
    estabilishmentURL?: string
    place: string
    availability: boolean
    ticketsURL?: string
  }>
  resources?: Array<{
    id: string
    title: string
    type: string
    description: string
    url: string
    extension?: string
    size?: string
  }>
  by?: string
}

// Valid workstream values
const VALID_WORKSTREAMS = ['democracy', 'politics-society', 'future-of-work', 'digital-economy']

// Normalize workstream values for consistency
function normalizeWorkstream(workstream: string | undefined): string {
  if (!workstream) return 'democracy'
  
  const normalized = workstream.toLowerCase().trim()
  
  // Check for exact matches
  if (VALID_WORKSTREAMS.includes(normalized)) {
    return normalized
  }
  
  // Handle common variations
  if (normalized === 'politics & society' || normalized === 'politics and society') {
    return 'politics-society'
  }
  
  if (normalized === 'future leadership') {
    return 'future-of-work'
  }
  
  if (normalized === 'digital world' || normalized === 'digital') {
    return 'digital-economy'
  }
  
  // Default fallback
  return 'democracy'
}

export const useVideoStore = defineStore('video', {
  state: () => ({
    videoList: [] as Video[],
    currentVideo: 0,
    homepageVideoEffect: false,
    navigation: true,
    menuVisibility: false
  }),
  
  getters: {
    hasVideos: state => state.videoList.length > 0,
    emptyEpisode: () => ({
      title: 'No video selected',
      description: 'Select a video to watch',
      source: 'youtube',
      videoUrl: ''
    }) as Video
  },
  
  actions: {
    setCurrentVideo(url: string) {
      const index = this.videoList.findIndex(v => v.videoUrl === url)
      if (index !== -1) {
        this.currentVideo = index
      }
    },
    setCurrentVideoIndex(index: number) {
      if (index >= 0 && index < this.videoList.length) {
        this.currentVideo = index
      }
    },
    setHomepageVideoEffect(val: boolean) {
      this.homepageVideoEffect = val
    },
    setNavigation(val: boolean) {
      this.navigation = val
    },
    setMenuVisibility(val: boolean) {
      this.menuVisibility = val
    },
    async fetchVideos() {
      try {
        const config = useRuntimeConfig()
        
        // If credentials are set, try to fetch from Contentful
        if (config.public.contentfulSpace && config.public.contentfulToken) {
          const client = contentful.createClient({
            space: config.public.contentfulSpace,
            accessToken: config.public.contentfulToken
          })
          
          try {
            const entries = await client.getEntries({
              content_type: 'documentary',
              order: ['-sys.createdAt'] as any
            })
            
            if (entries.items.length > 0) {
              this.videoList = entries.items.map(item => {
                const fields = item.fields as any
                return {
                  title: fields.title || 'Untitled',
                  description: fields.description || '',
                  subtitle: fields.subtitle || '',
                  videoUrl: fields.videoUrl || '',
                  source: fields.source || 'youtube',
                  workstream: normalizeWorkstream(fields.workstream),
                  backgroundImage: fields.backgroundImage?.fields?.file?.url || '',
                  tags: fields.tags || [],
                  // Map other fields as needed
                } as Video
              })
              return
            }
          } catch (err) {
            console.error('Contentful fetch error:', err)
            // Fall back to sample data if error fetching
          }
        }
        
        // Fall back to sample data
        console.log('Using sample data')
        this.videoList = [
          {
            title: 'The Great Reset',
            subtitle: 'How the world is changing after the pandemic',
            description: 'An exploration of the economic and social shifts following the global pandemic, examining both the challenges and opportunities for a more equitable society.',
            source: 'youtube',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            backgroundImage: '/assets/cicle_video.png',
            workstream: 'democracy',
            tags: ['pandemic', 'economy', 'social change'],
            by: 'Bertelsmann Foundation',
            awards: [
              {
                id: '1',
                title: 'Best Documentary',
                year: '2023',
                institution: 'International Film Festival'
              }
            ]
          },
          {
            title: 'Digital Frontiers',
            subtitle: 'The new era of technology',
            description: 'An in-depth look at how emerging technologies are reshaping business, government, and everyday life, with special focus on privacy and security concerns.',
            source: 'vimeo',
            videoUrl: 'https://vimeo.com/565486457',
            backgroundImage: '/assets/cicle_video.png',
            workstream: 'digital-economy',
            tags: ['technology', 'privacy', 'security'],
            by: 'Bertelsmann Foundation'
          },
          {
            title: 'Politics Today',
            subtitle: 'Understanding modern political systems',
            description: 'A comprehensive overview of political structures and systems in modern democracies.',
            source: 'youtube',
            videoUrl: 'https://www.youtube.com/watch?v=example3',
            backgroundImage: '/assets/cicle_video.png',
            workstream: 'politics-society',
            tags: ['politics', 'society', 'democracy'],
            by: 'Bertelsmann Foundation'
          },
          {
            title: 'Future of Work',
            subtitle: 'How technology is changing employment',
            description: 'An analysis of how automation, AI, and other technologies are transforming the workplace.',
            source: 'youtube',
            videoUrl: 'https://www.youtube.com/watch?v=example4',
            backgroundImage: '/assets/cicle_video.png',
            workstream: 'future-of-work',
            tags: ['work', 'automation', 'future'],
            by: 'Bertelsmann Foundation'
          }
        ]
      } catch (error) {
        console.error('Error in fetchVideos:', error)
      }
    }
  }
}) 