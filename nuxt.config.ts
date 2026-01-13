// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',
	devtools: {enabled: true},
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
	app: {
		head:{
			title: 'OdyFeed',
			htmlAttrs: {
				lang: 'en'
			},
			link: [
				{rel: 'icon', type: 'image/x-icon', href: '/favicon.ico'},
				{rel: 'me', href: 'https://github.com/artvandervennet'}
			]

		}
	}
})
