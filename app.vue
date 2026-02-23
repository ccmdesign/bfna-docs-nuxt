<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
import { useVideoStore } from '~/stores/video'

const videoStore = useVideoStore();

const { data: allvideos } = await useAsyncData('allvideos', () =>
  queryCollection('allvideos').order('docYear', 'ASC').order('order', 'ASC').all()
)
const videoList = Array.isArray(allvideos.value) ? allvideos.value : []
videoStore.setVideos(videoList)

// Featured: get first item from featuredvideos (order=1), then resolve full video from allvideos
const { data: featuredItem } = await useAsyncData('featuredvideo', () =>
  queryCollection('featuredvideos').where('order', '=', 1).first()
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
  queryCollection('featuredvideos').order('order', 'ASC').all()
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

const { data: series } = await useAsyncData('series', () => queryCollection('series').all())
videoStore.setSeries(Array.isArray(series.value) ? series.value : [])

const { data: filters } = await useAsyncData('filters', () => queryCollection('filters').first())
videoStore.setFiltersItems(filters.value ?? {})
</script>