import { DEFAULTS } from "~~/shared/constants"

export default defineEventHandler((event) => {
	// Handle CORS preflight
	if (event.method === 'OPTIONS') {
		setHeader(event, "Access-Control-Allow-Origin", "*")
		setHeader(event, "Access-Control-Allow-Methods", "GET, OPTIONS")
		setHeader(event, "Access-Control-Allow-Headers", "*")
		setHeader(event, "Access-Control-Max-Age", 86400)
		return ''
	}

	const baseUrl = process.env.BASE_URL || DEFAULTS.BASE_URL
	const clientId = `${baseUrl}/clientid.jsonld`
	const redirectUri = `${baseUrl}/api/auth/callback`

	const clientDocument = {
		"@context": "https://www.w3.org/ns/solid/oidc-context.jsonld",
		"client_id": clientId,
		"client_name": "OdyFeed",
		"redirect_uris": [redirectUri],
		"scope": "openid webid offline_access",
		"grant_types": ["authorization_code", "refresh_token"],
		"response_types": ["code"],
		"token_endpoint_auth_method": "none"
	}

	// Set proper headers for OIDC client document
	setHeader(event, "Content-Type", "application/ld+json; charset=utf-8")
	setHeader(event, "Access-Control-Allow-Origin", "*")
	setHeader(event, "Access-Control-Allow-Methods", "GET, OPTIONS")
	setHeader(event, "Access-Control-Allow-Headers", "*")
	setHeader(event, "Cache-Control", "public, max-age=3600")

	return clientDocument
})
