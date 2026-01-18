import { readFileSync } from "fs"
import { resolve } from "path"

export default defineEventHandler((event) => {
	// Handle CORS preflight
	if (event.method === 'OPTIONS') {
		setHeader(event, "Access-Control-Allow-Origin", "*")
		setHeader(event, "Access-Control-Allow-Methods", "GET, OPTIONS")
		setHeader(event, "Access-Control-Allow-Headers", "*")
		setHeader(event, "Access-Control-Max-Age", 86400)
		return ''
	}

	try {
		const filePath = resolve(process.cwd(), "public/clientid.jsonld")
		const content = readFileSync(filePath, "utf-8")

		// Set proper headers for OIDC client document
		setHeader(event, "Content-Type", "application/ld+json; charset=utf-8")
		setHeader(event, "Access-Control-Allow-Origin", "*")
		setHeader(event, "Access-Control-Allow-Methods", "GET, OPTIONS")
		setHeader(event, "Access-Control-Allow-Headers", "*")
		setHeader(event, "Cache-Control", "public, max-age=3600")

		return content
	} catch (error) {
		throw createError({
			statusCode: 500,
			statusMessage: "Failed to load client ID document",
		})
	}
})
