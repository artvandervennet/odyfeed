import type { AuthSession, TokenResponse, OIDCConfiguration } from '~/types/oidc';
import { generatePKCEChallenge, discoverOIDCConfiguration, parseJWT } from '~/utils/oidc';

const SESSION_STORAGE_KEY = 'activitypods_session';
const PKCE_STORAGE_KEY = 'activitypods_pkce';
const ISSUER_STORAGE_KEY = 'activitypods_issuer';

export const useActivityPodsAuth = function () {
	const baseUrl = typeof window !== 'undefined'
		? window.location.origin
		: 'http://localhost:3000';

	const clientId = `${baseUrl}/clientid.json`;
	const redirectUri = `${baseUrl}/callback`;

	const getStoredSession = function (): AuthSession | null {
		if (typeof window === 'undefined') return null;

		const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
		if (!stored) return null;

		try {
			const session = JSON.parse(stored) as AuthSession;
			if (session.expiresAt && session.expiresAt < Date.now()) {
				return null;
			}
			return session;
		} catch {
			return null;
		}
	};

	const storeSession = function (session: AuthSession): void {
		if (typeof window === 'undefined') return;
		sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
	};

	const clearSession = function (): void {
		if (typeof window === 'undefined') return;
		sessionStorage.removeItem(SESSION_STORAGE_KEY);
		sessionStorage.removeItem(PKCE_STORAGE_KEY);
		sessionStorage.removeItem(ISSUER_STORAGE_KEY);
	};

	const startLoginFlow = async function (issuer: string): Promise<void> {
		if (typeof window === 'undefined') return;

		const oidcConfig = await discoverOIDCConfiguration(issuer);

		const pkce = await generatePKCEChallenge();
		const state = crypto.randomUUID();

		sessionStorage.setItem(PKCE_STORAGE_KEY, JSON.stringify(pkce));
		sessionStorage.setItem(ISSUER_STORAGE_KEY, issuer);

		const authUrl = new URL(oidcConfig.authorization_endpoint);
		authUrl.searchParams.set('client_id', clientId);
		authUrl.searchParams.set('redirect_uri', redirectUri);
		authUrl.searchParams.set('response_type', 'code');
		authUrl.searchParams.set('scope', 'openid offline_access webid');
		authUrl.searchParams.set('code_challenge', pkce.codeChallenge);
		authUrl.searchParams.set('code_challenge_method', 'S256');
		authUrl.searchParams.set('state', state);

		window.location.href = authUrl.toString();
	};

	const handleCallback = async function (): Promise<AuthSession | null> {
		if (typeof window === 'undefined') return null;

		const params = new URLSearchParams(window.location.search);
		const code = params.get('code');
		const error = params.get('error');

		if (error) {
			console.error('OAuth error:', error, params.get('error_description'));
			throw new Error(`Authentication failed: ${error}`);
		}

		if (!code) {
			return null;
		}

		const pkceString = sessionStorage.getItem(PKCE_STORAGE_KEY);
		const issuer = sessionStorage.getItem(ISSUER_STORAGE_KEY);

		if (!pkceString || !issuer) {
			throw new Error('Missing PKCE or issuer information');
		}

		const pkce = JSON.parse(pkceString);
		const oidcConfig = await discoverOIDCConfiguration(issuer);

		const tokenResponse = await fetch(oidcConfig.token_endpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams({
				grant_type: 'authorization_code',
				code,
				redirect_uri: redirectUri,
				client_id: clientId,
				code_verifier: pkce.codeVerifier,
			}),
		});

		if (!tokenResponse.ok) {
			const errorText = await tokenResponse.text();
			console.error('Token exchange failed:', errorText);
			throw new Error('Failed to exchange authorization code for tokens');
		}

		const tokens: TokenResponse = await tokenResponse.json();

		const idTokenPayload = parseJWT(tokens.id_token);
		const webId = idTokenPayload.webId || idTokenPayload.sub || '';

		const session: AuthSession = {
			webId,
			idToken: tokens.id_token,
			accessToken: tokens.access_token,
			refreshToken: tokens.refresh_token,
			expiresAt: Date.now() + (tokens.expires_in * 1000),
			issuer,
		};

		storeSession(session);
		sessionStorage.removeItem(PKCE_STORAGE_KEY);

		window.history.replaceState({}, '', window.location.pathname);

		return session;
	};

	const refreshSession = async function (session: AuthSession): Promise<AuthSession | null> {
		if (!session.refreshToken) {
			return null;
		}

		try {
			const oidcConfig = await discoverOIDCConfiguration(session.issuer);

			const tokenResponse = await fetch(oidcConfig.token_endpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: new URLSearchParams({
					grant_type: 'refresh_token',
					refresh_token: session.refreshToken,
					client_id: clientId,
				}),
			});

			if (!tokenResponse.ok) {
				console.error('Token refresh failed');
				return null;
			}

			const tokens: TokenResponse = await tokenResponse.json();

			const idTokenPayload = parseJWT(tokens.id_token);
			const webId = idTokenPayload.webId || idTokenPayload.sub || session.webId;

			const newSession: AuthSession = {
				webId,
				idToken: tokens.id_token,
				accessToken: tokens.access_token,
				refreshToken: tokens.refresh_token || session.refreshToken,
				expiresAt: Date.now() + (tokens.expires_in * 1000),
				issuer: session.issuer,
			};

			storeSession(newSession);
			return newSession;
		} catch (error) {
			console.error('Failed to refresh session:', error);
			return null;
		}
	};

	const logout = async function (session: AuthSession): Promise<void> {
		try {
			const oidcConfig = await discoverOIDCConfiguration(session.issuer);

			if (oidcConfig.end_session_endpoint) {
				const logoutUrl = new URL(oidcConfig.end_session_endpoint);
				logoutUrl.searchParams.set('id_token_hint', session.idToken);
				logoutUrl.searchParams.set('post_logout_redirect_uri', baseUrl);

				clearSession();
				window.location.href = logoutUrl.toString();
			} else {
				clearSession();
				window.location.href = baseUrl;
			}
		} catch (error) {
			console.error('Logout failed:', error);
			clearSession();
			window.location.href = baseUrl;
		}
	};

	const fetchWithAuth = async function (session: AuthSession, url: string, options: RequestInit = {}): Promise<Response> {
		const headers = new Headers(options.headers);
		headers.set('Authorization', `Bearer ${session.accessToken}`);

		if (!headers.has('Accept')) {
			headers.set('Accept', 'application/ld+json, application/json');
		}

		return fetch(url, {
			...options,
			headers,
		});
	};

	const fetchWithAccessToken = async function (session: AuthSession, url: string, options: RequestInit = {}): Promise<Response> {
		const headers = new Headers(options.headers);
		headers.set('Authorization', `Bearer ${session.accessToken}`);

		if (!headers.has('Accept')) {
			headers.set('Accept', 'application/ld+json, application/json');
		}

		return fetch(url, {
			...options,
			headers,
		});
	};

	return {
		startLoginFlow,
		handleCallback,
		refreshSession,
		logout,
		getStoredSession,
		clearSession,
		fetchWithAuth,
		fetchWithAccessToken,
	};
};
