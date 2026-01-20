// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',
	devtools: {
		enabled: true,


		timeline: {
			enabled: true,
		},
	},
	modules: [
		'@nuxt/eslint',
		'@nuxt/ui',
		'@pinia/nuxt',
		'@nuxt/icon',
		'@pinia/colada-nuxt',
	],
	css: ['~/assets/css/main.css'],
	ssr: false,

	vite: {
		server: {
			allowedHosts: [
				'.ngrok-free.dev',
				'.ngrok.io',
				'.ngrok.app',
				'.ikdoeict.be',
				'odyfeed.artvandervennet.ikdoeict.be',
				'localhost',
			],
		},
	},

	runtimeConfig: {
		openaiApiKey: process.env.OPENAI_API_KEY,
		activitypubPageSize: process.env.ACTIVITYPUB_PAGE_SIZE || '20',
		public: {
			baseUrl: process.env.BASE_URL || 'http://localhost:3000',
		},
	},
	vue: {
		compilerOptions: {
			isCustomElement: (tag) => tag === 'solid-vcard-card',
		},
	},
	app: {
		head: {
			title: 'OdyFeed',
			htmlAttrs: {
				lang: 'en',
			},
			meta: [
				{charset: 'utf-8'},
				{name: 'viewport', content: 'width=device-width, initial-scale=1'},
			],
			link: [
				{rel: 'icon', type: 'image/x-icon', href: '/favicon.ico'},
				{rel: 'me', href: 'https://github.com/artvandervennet'},
				{rel: 'webmention', href: '/api/webmentions'},
			],

		},
	},
})