import type { H3Event } from 'h3'
import { createVerify, createHash } from 'crypto'
import { logInfo, logError, logDebug } from './logger'
import type { ASActor } from '~~/shared/types/activitypub'

interface SignatureComponents {
	keyId: string
	algorithm: string
	headers: string[]
	signature: string
}

const parseSignatureHeader = function (signatureHeader: string): SignatureComponents | null {
	try {
		const parts: Record<string, string> = {}
		const regex = /(\w+)="([^"]+)"/g
		let match

		while ((match = regex.exec(signatureHeader)) !== null) {
			parts[match[1]] = match[2]
		}

		if (!parts.keyId || !parts.algorithm || !parts.headers || !parts.signature) {
			return null
		}

		return {
			keyId: parts.keyId,
			algorithm: parts.algorithm,
			headers: parts.headers.split(' '),
			signature: parts.signature,
		}
	} catch (error) {
		logError('Failed to parse signature header', error)
		return null
	}
}

const fetchActorPublicKey = async function (actorId: string): Promise<string | null> {
	try {
		logDebug(`Fetching actor public key from: ${actorId}`)

		const response = await $fetch<ASActor>(actorId, {
			headers: {
				'Accept': 'application/ld+json, application/activity+json',
			},
		})

		if (response?.publicKey?.publicKeyPem) {
			logDebug('Successfully retrieved public key')
			return response.publicKey.publicKeyPem
		}

		logError(`No public key found for actor: ${actorId}`)
		return null
	} catch (error) {
		logError(`Failed to fetch actor public key from ${actorId}`, error)
		return null
	}
}

const reconstructSigningString = function (
	event: H3Event,
	headers: string[],
	body: string
): string | null {
	try {
		const lines: string[] = []
		const url = getRequestURL(event)

		for (const header of headers) {
			if (header === '(request-target)') {
				const method = event.method.toLowerCase()
				const path = url.pathname + url.search
				lines.push(`(request-target): ${method} ${path}`)
			} else if (header === 'digest' && body) {
				const digest = `SHA-256=${createHash('sha256').update(body).digest('base64')}`
				lines.push(`digest: ${digest}`)
			} else {
				const headerValue = getHeader(event, header)
				if (headerValue) {
					lines.push(`${header.toLowerCase()}: ${headerValue}`)
				} else {
					logError(`Missing required header: ${header}`)
					return null
				}
			}
		}

		return lines.join('\n')
	} catch (error) {
		logError('Failed to reconstruct signing string', error)
		return null
	}
}

export const verifyHttpSignature = async function (
	event: H3Event,
	body: string
): Promise<{ verified: boolean; actorId?: string }> {
	try {
		const signatureHeader = getHeader(event, 'signature')

		if (!signatureHeader) {
			logDebug('No signature header present')
			return { verified: false }
		}

		const components = parseSignatureHeader(signatureHeader)
		if (!components) {
			logError('Invalid signature header format')
			return { verified: false }
		}

		const actorId = components.keyId.split('#')[0]
		logInfo(`Verifying signature for actor: ${actorId}`)

		const publicKeyPem = await fetchActorPublicKey(actorId)
		if (!publicKeyPem) {
			logError(`Could not retrieve public key for ${actorId}`)
			return { verified: false }
		}

		const signingString = reconstructSigningString(event, components.headers, body)
		if (!signingString) {
			logError('Failed to reconstruct signing string')
			return { verified: false }
		}

		const verifier = createVerify('sha256')
		verifier.update(signingString)
		verifier.end()

		const verified = verifier.verify(publicKeyPem, components.signature, 'base64')

		if (verified) {
			logInfo(`✅ HTTP signature verified for ${actorId}`)
		} else {
			logError(`❌ HTTP signature verification failed for ${actorId}`)
		}

		return { verified, actorId: verified ? actorId : undefined }
	} catch (error) {
		logError('Error during HTTP signature verification', error)
		return { verified: false }
	}
}
