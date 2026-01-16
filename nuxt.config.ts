// https://nuxt.com/docs/api/configuration/nuxt-config
import { writeFileSync } from 'fs';
import { resolve } from 'path';

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
			baseUrl: process.env.BASE_URL || 'http://localhost:3000'
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
	},
	nitro: {
		hooks: {
			'compiled': () => {
				const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
				const clientIdConfig = {
					"@context": "https://www.w3.org/ns/solid/oidc-context.jsonld",
					"client_id": `${baseUrl}/clientid.json`,
					"client_name": "OdyFeed",
					"redirect_uris": [`${baseUrl}/callback`],
					"post_logout_redirect_uris": [baseUrl],
					"token_endpoint_auth_method": "none",
					"application_type": "web",
					"response_types": ["code"],
					"grant_types": ["authorization_code", "refresh_token"],
					"scope": "openid offline_access webid"
				};

				const outputPublic = resolve(process.cwd(), '.output', 'public');
				const clientIdPath = resolve(outputPublic, 'clientid.json');
				writeFileSync(clientIdPath, JSON.stringify(clientIdConfig, null, 2));
				console.log(`✅ Generated clientid.json with BASE_URL: ${baseUrl}`);
			}
		}
	}
})
