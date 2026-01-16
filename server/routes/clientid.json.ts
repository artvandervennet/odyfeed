export default defineEventHandler((event) => {
	const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

	setResponseHeader(event, 'Content-Type', 'application/json');
	setResponseHeader(event, 'Access-Control-Allow-Origin', '*');
	setResponseHeader(event, 'Cache-Control', 'public, max-age=3600');

	return {
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
});
