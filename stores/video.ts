import { defineStore } from 'pinia'
import { createClient } from 'vue-contentful'

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
      // For now, use hardcoded data until Contentful is set up
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
        }
      ]
    }
  }
}) 