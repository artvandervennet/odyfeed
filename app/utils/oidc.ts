import type { PKCEChallenge, OIDCConfiguration } from '~/types/oidc';

export const generateRandomString = function (length: number): string {
	const array = new Uint8Array(length);
	crypto.getRandomValues(array);
	return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const base64UrlEncode = function (buffer: ArrayBuffer): string {
	const bytes = new Uint8Array(buffer);
	let binary = '';
	for (let i = 0; i < bytes.byteLength; i++) {
		const byte = bytes[i];
		if (byte !== undefined) {
			binary += String.fromCharCode(byte);
		}
	}
	return btoa(binary)
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=/g, '');
};

export const generatePKCEChallenge = async function (): Promise<PKCEChallenge> {
	const codeVerifier = generateRandomString(64);
	const encoder = new TextEncoder();
	const data = encoder.encode(codeVerifier);
	const digest = await crypto.subtle.digest('SHA-256', data);
	const codeChallenge = base64UrlEncode(digest);

	return {
		codeVerifier,
		codeChallenge
	};
};

export const discoverOIDCConfiguration = async function (issuer: string): Promise<OIDCConfiguration> {
	const wellKnownUrl = new URL('/.well-known/openid-configuration', issuer).toString();

	try {
		const response = await fetch(wellKnownUrl);
		if (!response.ok) {
			throw new Error(`Failed to fetch OIDC configuration: ${response.statusText}`);
		}
		const res = await response.json();
		console.log('OIDC configuration discovered:', res);
		return res;
	} catch (error) {
		console.error('OIDC discovery failed:', error);
		throw new Error(`Failed to discover OIDC configuration for ${issuer}`);
	}
};

export const parseJWT = function (token: string): { webId?: string; sub?: string; exp?: number } {
	try {
		const parts = token.split('.');
		if (parts.length !== 3 || !parts[1]) {
			throw new Error('Invalid JWT format');
		}

		const payload = parts[1];
		const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
		return JSON.parse(decoded);
	} catch (error) {
		console.error('Failed to parse JWT:', error);
		return {};
	}
};
