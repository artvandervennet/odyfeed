export interface OIDCConfiguration {
	issuer: string;
	authorization_endpoint: string;
	token_endpoint: string;
	end_session_endpoint?: string;
	jwks_uri: string;
	response_types_supported: string[];
	grant_types_supported: string[];
	token_endpoint_auth_methods_supported: string[];
}

export interface TokenResponse {
	access_token: string;
	token_type: string;
	expires_in: number;
	refresh_token?: string;
	id_token: string;
	scope: string;
}

export interface AuthSession {
	webId: string;
	idToken: string;
	refreshToken?: string;
	accessToken: string;
	expiresAt: number;
	issuer: string;
}

export interface PKCEChallenge {
	codeVerifier: string;
	codeChallenge: string;
}
