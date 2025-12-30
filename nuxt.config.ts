// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',
	devtools: {enabled: true},
	modules: [
		'@nuxt/eslint',
		'@nuxt/ui',
		'@pinia/nuxt',
		'@nuxt/icon',
	],
	icon: {
		clientBundle: {
			scan: true,
		},
	},
	css: ['~/assets/css/main.css'],
	ssr: true,
	nitro: {
		preset: 'node-server', // kan ook serverless zijn
	},
	runtimeConfig: {
		openaiApiKey: process.env.OPENAI_API_KEY,
		public: {
			baseUrl: process.env.ODYSSEY_BASE_URL
		},
	},
})