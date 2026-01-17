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
				"acl": "http://www.w3.org/ns/auth/acl#",
				"foaf": "http://xmlns.com/foaf/0.1/"
			}
		],
		"@id": `${baseUrl}/app.json`,
		"@type": "interop:Application",
		"client_id": `${baseUrl}/clientid.json`,
		"client_name": "OdyFeed",
		"interop:applicationName": "OdyFeed",
		"interop:applicationDescription": "A social feed reader for ActivityPods and ActivityPub",
		"interop:applicationAuthor": {
			"@id": podProvider,
			"@type": "foaf:Person"
		},
		"interop:applicationDeveloperAccount": podProvider,
		"interop:applicationThumbnail": `${baseUrl}/favicon.ico`,
		"interop:hasAccessNeedGroup": {
			"@type": "interop:AccessNeedGroup",
			"interop:accessNecessity": "interop:AccessRequired",
			"interop:accessScenario": "interop:PersonalAccess",
			"interop:authenticatedAs": "interop:SocialAgent",
			"interop:hasAccessNeed": [
				{
					"@type": "interop:AccessNeed",
					"interop:accessMode": "acl:Read",
					"interop:registeredShapeTree": "https://www.w3.org/ns/activitystreams#Inbox"
				},
				{
					"@type": "interop:AccessNeed",
					"interop:accessMode": ["acl:Read", "acl:Write"],
					"interop:registeredShapeTree": "https://www.w3.org/ns/activitystreams#Outbox"
				},
				{
					"@type": "interop:AccessNeed",
					"interop:accessMode": "acl:Read",
					"interop:registeredShapeTree": "https://www.w3.org/ns/activitystreams#Profile"
				}
			]
		},
		"redirect_uris": [`${baseUrl}/callback`],
		"post_logout_redirect_uris": [baseUrl],
		"token_endpoint_auth_method": "none",
		"application_type": "web",
		"response_types": ["code"],
		"grant_types": ["authorization_code", "refresh_token"],
		"scope": "openid offline_access webid"
	};
});
