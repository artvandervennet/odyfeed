// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',
	devtools: {enabled: true},
	nitro: {
		prerender: {
			crawlLinks: true,
			routes: ['/sitemap.xml'],
		},
	},
	modules: [
		'@nuxt/eslint',
		'@nuxt/ui',
		'@pinia/nuxt',
		'@nuxt/icon',
		'@pinia/colada-nuxt'
	],
	icon: {
		clientBundle: {
			scan: true,
		},
	},
	css: ['~/assets/css/main.css'],
	ssr: true,
	runtimeConfig: {
		openaiApiKey: process.env.OPENAI_API_KEY,
		public: {
			baseUrl: process.env.ODYSSEY_BASE_URL
		},
	},
})