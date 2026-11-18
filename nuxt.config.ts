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
		'@pinia/nuxt',
		'@nuxt/icon',
		'@pinia/colada-nuxt',
	],
	// The look comes from Gesso (https://github.com/artvandervennet/gesso): its fonts, tokens,
	// base styles and page anatomy, then OdyFeed's own theme ("Aegean", generated from
	// theme.json with `pnpm theme`) and the styles that are specific to this app.
	css: [
		'@vandervennet/gesso/fonts.css',
		'@vandervennet/gesso/core.css',
		'@vandervennet/gesso/base.css',
		'@vandervennet/gesso/layout.css',
		'~/assets/css/theme.css',
		'~/assets/css/main.css',
	],
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
			// Gesso's elements (art-header, art-button, …) and the Solid vCard are native custom elements
			isCustomElement: (tag) => tag.startsWith('art-') || tag === 'solid-vcard-card',
		},
	},
	app: {
		head: {
			title: 'OdyFeed',
			htmlAttrs: {
				lang: 'en',
				// light, dark, or "auto" to follow the visitor's system. <art-scheme> changes it.
				'data-scheme': 'auto',
			},
			meta: [
				{charset: 'utf-8'},
				{name: 'viewport', content: 'width=device-width, initial-scale=1'},
			],
			link: [
				// The logo (public/logo.svg): Odysseus's ship with a post's speech bubble for a sail.
				// The .ico is for browsers without SVG icons.
				{rel: 'icon', href: '/favicon.ico', sizes: '32x32 48x48'},
				{rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg'},
				{rel: 'apple-touch-icon', href: '/apple-touch-icon.png'},
				{rel: 'me', href: 'https://github.com/artvandervennet'},
				{rel: 'webmention', href: '/api/webmentions'},
			],
			script: [
				{
					// the visitor's remembered choice, applied before the first paint
					innerHTML: 'try { const s = localStorage.getItem(\'gesso-scheme\'); if (s) document.documentElement.dataset.scheme = s; } catch {}',
				},
			],
		},
	},
})
