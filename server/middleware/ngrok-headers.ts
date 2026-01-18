export default defineEventHandler((event) => {
	const url = getRequestURL(event)

	// Add ngrok bypass header for all requests to help with external service access
	if (url.hostname.includes('ngrok-free.dev') || url.hostname.includes('ngrok.io') || url.hostname.includes('ngrok.app')) {
		setResponseHeader(event, 'ngrok-skip-browser-warning', 'true')
	}

	// Allow CORS for all routes
	setResponseHeader(event, 'Access-Control-Allow-Origin', '*')
	setResponseHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
	setResponseHeader(event, 'Access-Control-Allow-Headers', '*')

	// Handle OPTIONS preflight
	if (event.method === 'OPTIONS') {
		setResponseHeader(event, 'Access-Control-Max-Age', 86400)
		return ''
	}
})
