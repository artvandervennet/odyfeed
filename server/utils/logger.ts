import { appendFileSync, existsSync, mkdirSync } from 'fs'
import { resolve } from 'path'

const LOG_DIR = resolve(process.cwd(), 'logs')
const LOG_FILE = resolve(LOG_DIR, 'activitypub.log')

const ensureLogDir = function (): void {
	if (!existsSync(LOG_DIR)) {
		mkdirSync(LOG_DIR, { recursive: true })
	}
}

const formatLogEntry = function (level: string, message: string, data?: unknown): string {
	const timestamp = new Date().toISOString()
	let logEntry = `[${timestamp}] [${level}] ${message}`

	if (data !== undefined) {
		if (typeof data === 'object') {
			logEntry += ` ${JSON.stringify(data, null, 2)}`
		} else {
			logEntry += ` ${data}`
		}
	}

	return logEntry + '\n'
}

export const logInfo = function (message: string, data?: unknown): void {
	ensureLogDir()
	const entry = formatLogEntry('INFO', message, data)
	appendFileSync(LOG_FILE, entry, 'utf-8')
}

export const logError = function (message: string, error?: unknown): void {
	ensureLogDir()
	const errorData = error instanceof Error
		? { message: error.message, stack: error.stack }
		: error
	const entry = formatLogEntry('ERROR', message, errorData)
	appendFileSync(LOG_FILE, entry, 'utf-8')
}

export const logDebug = function (message: string, data?: unknown): void {
	ensureLogDir()
	const entry = formatLogEntry('DEBUG', message, data)
	appendFileSync(LOG_FILE, entry, 'utf-8')
}
