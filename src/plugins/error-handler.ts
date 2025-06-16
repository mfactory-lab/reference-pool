import { defineNuxtPlugin } from 'nuxt/app'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.config.errorHandler = (error, _instance, _info) => {
    // handle error, e.g. report to a service
    console.log('SSR ERROR:', error)
  }

  // Also possible
  nuxtApp.hook('vue:error', (error, _instance, _info) => {
    // handle error, e.g. report to a service
    console.log('Client error:', error)
  })
})
