// no node_modules available in the CDN
export default defineNuxtPlugin((nuxtApp) => {
    // Assumes vueVimeoPlayer is available globally via CDN as window.vueVimeoPlayer
    if (typeof window !== 'undefined' && (window as any).vueVimeoPlayer) {
        nuxtApp.vueApp.component('Vimeo-Player', (window as any).vueVimeoPlayer)
    } else {
        // Optionally, warn if the CDN script is missing
        console.warn('vueVimeoPlayer is not loaded. Please check your CDN import.')
    }
})