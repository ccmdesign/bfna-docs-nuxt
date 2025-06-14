import { defineStore } from 'pinia'

export interface Video {
  videoId: string
  slug: string
  order: number
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
    screenshot_extras?: Array<{ id: string, url: string, title: string }>,
    duration?: string,
    year?: string,
    thumbnail?: string
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
    currentVideo: {} as Video,
    latest: [] as Video[],
    featuredVideosList: [] as Video[],
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
    }) as Video,
    getCurrentVideoBasedOnSlug: (state) => {
      const route = useRoute();
      const slug = route.params.slug as string
      
      if (slug === undefined || slug === '') {
        return state.currentVideo
      }
      // Find the video by slug
      return state.videoList.find(video => video.slug === slug) || state.currentVideo
    }
  },
  
  actions: {
    setCurrentVideo(video: Video) {
      if (video !== undefined) {
        this.currentVideo = video
      }
    },
    setCurrentVideoFromSlug(slug: string) {
      if (slug !== '') {
        this.currentVideo = this.videoList.find(video => video.videoId === slug) || this.emptyEpisode
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
    setVideos(videos: Video[]) {
      this.videoList = videos
    },
    setFeaturedList(videos: Video[]) {
      this.featuredVideosList = videos
    },
    setLatestVideos(videos: Video[]) {
      this.latest = videos
    }
  }
}) 