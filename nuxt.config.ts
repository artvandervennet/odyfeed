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
	css: ['~/assets/css/main.css'],
	ssr: false,

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
			meta: [
				{ charset: 'utf-8' },
				{ name: 'viewport', content: 'width=device-width, initial-scale=1' }
			],
			link: [
				{rel: 'icon', type: 'image/x-icon', href: '/favicon.ico'},
				{rel: 'me', href: 'https://github.com/artvandervennet'},
				{rel:'webmention', href: 'https://webmention.io/odyfeed.artvandervennet.ikdoeict.be/webmention'},
			]

		}
	}
})
