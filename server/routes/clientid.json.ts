export default defineEventHandler((event) => {
	const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
	const podProvider = process.env.POD_PROVIDER || 'https://vandervennet.art';

	setResponseHeader(event, 'Content-Type', 'application/json');
	setResponseHeader(event, 'Access-Control-Allow-Origin', '*');
	setResponseHeader(event, 'Cache-Control', 'public, max-age=3600');

	return {
		"@context": [
			"https://www.w3.org/ns/solid/oidc-context.jsonld",
			{
				"interop": "http://www.w3.org/ns/solid/interop#",
				"as": "https://www.w3.org/ns/activitystreams#",
				"foaf": "http://xmlns.com/foaf/0.1/"
			}
		],
		"client_id": `${baseUrl}/clientid.json`,
		"client_name": "OdyFeed",
		"interop:applicationDeveloperAccount": podProvider,
		"interop:applicationRegistration": `${baseUrl}/app.json`,
		"redirect_uris": [`${baseUrl}/callback`],
		"post_logout_redirect_uris": [baseUrl],
		"token_endpoint_auth_method": "none",
		"application_type": "web",
		"response_types": ["code"],
		"grant_types": ["authorization_code", "refresh_token"],
		"scope": "openid webid"
	};
});
