// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint'],
  css: ['~/assets/css/main.css'],
  ssr: true,
  nitro: {
    preset: 'node-server' // kan ook serverless zijn
  },
  runtimeConfig: {
    public: {
      baseUrl: process.env.ODYSSEY_BASE_URL
    }
  },
})