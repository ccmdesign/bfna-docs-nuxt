import { useHead, useRuntimeConfig } from '#imports'

type GtagWindow = Window & {
  dataLayer?: any[]
  gtag?: (...args: any[]) => void
}

export default defineNuxtPlugin((nuxtApp) => {
  const {
    public: { gaMeasurementId = 'G-L3GWV0YT4W' }
  } = useRuntimeConfig()

  const measurementId = gaMeasurementId || 'G-L3GWV0YT4W'

  if (!measurementId) {
    return
  }

  useHead({
    script: [
      {
        src: `https://www.googletagmanager.com/gtag/js?id=${measurementId}`,
        async: true
      }
    ]
  })

  const win = window as GtagWindow
  win.dataLayer = win.dataLayer || []
  win.gtag =
    win.gtag ||
    function (...args: any[]) {
      win.dataLayer?.push(args)
    }

  win.gtag('js', new Date())
  win.gtag('config', measurementId, { send_page_view: false })

  const sendPageView = () => {
    win.gtag?.('event', 'page_view', {
      page_title: document.title,
      page_path: `${window.location.pathname}${window.location.search}`,
      page_location: window.location.href
    })
  }

  sendPageView()

  nuxtApp.hook('page:finish', sendPageView)
})
