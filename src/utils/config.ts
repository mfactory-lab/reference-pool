export const getRuntimeConfig = () => {
  // @ts-expect-error...
  return globalThis?.__NUXT__?.config.public ?? {}
}
