export interface SolidProvider {
	name: string
	url: string
	description: string
	icon: string
}

export const useAuthProviders = function () {
	const providers: SolidProvider[] = [
		{
			name: 'Inrupt PodSpaces',
			url: 'https://login.inrupt.com',
			description: 'Enterprise Solid pods by Inrupt',
			icon: 'i-heroicons-building-office',
		},
		{
			name: 'solidcommunity.net',
			url: 'https://solidcommunity.net',
			description: 'Community Solid pod provider',
			icon: 'i-heroicons-cube',
		},
		{
			name: 'solidweb.org',
			url: 'https://solidweb.org',
			description: 'Public Solid pod provider',
			icon: 'i-heroicons-globe-alt',
		},
	]

	const isNgrok = computed(() => {
		if (typeof window === 'undefined') return false
		return window.location.hostname.includes('ngrok')
	})

	const getProviderByUrl = function (url: string): SolidProvider | undefined {
		return providers.find((p) => p.url === url)
	}

	return {
		providers,
		isNgrok,
		getProviderByUrl,
	}
}
