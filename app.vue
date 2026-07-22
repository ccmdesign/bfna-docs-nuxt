<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
import { useVideoStore } from '~/stores/video'

const videoStore = useVideoStore();

// BF-123: select only the columns the app actually reads. The point is to leave
// behind `meta`, whose `meta.body` is a byte-for-byte duplicate of the whole
// source record that @nuxt/content stores next to the schema columns (136 KB of
// the 273 KB `allvideos` payload) and which nothing in this repo ever reads.
// Everything else stays: pages/[slug].vue renders the detail view out of this
// same list (stores/video.ts `setCurrentVideoFromSlug`), so it needs the full
// description/resources/awards/series/keywords set too.
const ALLVIDEOS_FIELDS = [
  'id', 'videoId', 'slug', 'title', 'subtitle', 'by', 'description',
  'date', 'docYear', 'order', 'workstream', 'source', 'videoUrl',
  'backgroundImage', 'backgroundImageCard', 'animatedThumbnail',
  'previewStartsAt', 'tags', 'keywords', 'series', 'relatedDocumentaries',
  'resources', 'awards', 'screenings', 'video_info'
]

// The featuredvideos rows are only ever used to look the real film up in
// `allvideos` by slug/stem/id, so four columns is the whole requirement.
const FEATURED_FIELDS = ['id', 'slug', 'stem', 'order']

const { data: allvideos } = await useAsyncData('allvideos', () =>
  queryCollection('allvideos').select(...ALLVIDEOS_FIELDS).order('date', 'DESC').all()
)
const videoList = Array.isArray(allvideos.value) ? allvideos.value : []
videoStore.setVideos(videoList)

// Featured: get first item from featuredvideos (order=1), then resolve full video from allvideos
const { data: featuredItem } = await useAsyncData('featuredvideo', () =>
  queryCollection('featuredvideos').select(...FEATURED_FIELDS).where('order', '=', 1).first()
)


const matchFeaturedVideo = (video) => {
  const item = featuredItem.value
  if (!item) return false
  return (
    (item.slug && video?.slug === item.slug) ||
    (item.stem && video?.slug === item.stem) ||
    String(video?.id ?? video?.videoId ?? '') === String(item?.id ?? '')
  )
}
const featured = featuredItem.value ? videoList.find(matchFeaturedVideo) ?? videoList[0] : videoList[0]
const defaultVideo = videoStore.emptyEpisode
videoStore.setCurrentVideo(featured ?? defaultVideo)
videoStore.setFeaturedVideo(featured ?? defaultVideo)

const { data: featuredvideosItems } = await useAsyncData('featuredvideos', () =>
  queryCollection('featuredvideos').select(...FEATURED_FIELDS).order('order', 'ASC').all()
)
const featuredItems = Array.isArray(featuredvideosItems.value) ? featuredvideosItems.value : []
const featuredvideos = featuredItems
  .map((item) => {
    const match = videoList.find(
      (v) =>
        (item?.slug && v?.slug === item.slug) ||
        (item?.stem && v?.slug === item.stem) ||
        String(v?.id ?? v?.videoId ?? '') === String(item?.id ?? '')
    )
    return match
  })
  .filter(Boolean)
videoStore.setFeaturedList(featuredvideos)

const { data: series } = await useAsyncData('series', () =>
  queryCollection('series').select('serieId', 'slug', 'title', 'description', 'documentaries').all()
)
videoStore.setSeries(Array.isArray(series.value) ? series.value : [])

const { data: filters } = await useAsyncData('filters', () =>
  queryCollection('filters').select('slug', 'years', 'workstreams', 'durations').first()
)
videoStore.setFiltersItems(filters.value ?? {})
</script>