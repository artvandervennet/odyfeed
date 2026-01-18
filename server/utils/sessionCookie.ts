import { H3Event } from 'h3'
import { randomBytes } from 'crypto'

const SESSION_COOKIE_NAME = 'odyfeed_session'

export interface CookieOptions {
	httpOnly?: boolean
	secure?: boolean
	sameSite?: 'strict' | 'lax' | 'none'
	maxAge?: number
	temporary?: boolean
}

export const generateSessionId = function (): string {
	return randomBytes(32).toString('hex')
}

export const setSessionCookie = function (
	event: H3Event,
	sessionId: string,
	options: CookieOptions = {}
): void {
	const defaultOptions: CookieOptions = {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		maxAge: options.temporary ? 60 * 10 : 60 * 60 * 24 * 7, // 10 min temp, 7 days permanent
		...options,
	}

	setCookie(event, SESSION_COOKIE_NAME, sessionId, defaultOptions)
}

export const getSessionCookie = function (event: H3Event): string | undefined {
	return getCookie(event, SESSION_COOKIE_NAME)
}

export const clearSessionCookie = function (event: H3Event): void {
	deleteCookie(event, SESSION_COOKIE_NAME)
}
