import type { IStorage } from '@inrupt/solid-client-authn-node'
import { createDataStorage } from './fileStorage'
import { logInfo, logDebug, logError } from './logger'

class SolidPersistentStorage implements IStorage {
	private storage = createDataStorage()
	private storagePrefix = 'solid-sessions/'

	private sanitizeKey(key: string): string {
		// Replace characters that are invalid in Windows filenames
		// : (colon), / (slash), \ (backslash), ? (question), * (asterisk), " (quote), < > |
		return key
			.replace(/:/g, '_')
			.replace(/\//g, '_')
			.replace(/\\/g, '_')
			.replace(/\?/g, '_')
			.replace(/\*/g, '_')
			.replace(/"/g, '_')
			.replace(/</g, '_')
			.replace(/>/g, '_')
			.replace(/\|/g, '_')
	}

	private getKey(key: string): string {
		const sanitized = this.sanitizeKey(key)
		return `${this.storagePrefix}${sanitized}.json`
	}

	async get(key: string): Promise<string | undefined> {
		const filePath = this.getKey(key)

		try {
			if (!this.storage.exists(filePath)) {
				logDebug(`[SolidStorage] Key not found: ${key}`)
				return undefined
			}

			const data = this.storage.read<{ value: string }>(filePath)
			logDebug(`[SolidStorage] Retrieved key: ${key}`)
			return data.value
		} catch (error) {
			logError(`[SolidStorage] Error reading key ${key}`, error)
			return undefined
		}
	}

	async set(key: string, value: string): Promise<void> {
		const filePath = this.getKey(key)

		try {
			this.storage.write(filePath, { value }, { pretty: false })
			logDebug(`[SolidStorage] Stored key: ${key}`)
		} catch (error) {
			logError(`[SolidStorage] Error storing key ${key}`, error)
			throw error
		}
	}

	async delete(key: string): Promise<void> {
		const filePath = this.getKey(key)

		try {
			if (this.storage.exists(filePath)) {
				const { unlinkSync } = await import('fs')
				const { resolve } = await import('path')
				const fullPath = resolve(process.cwd(), 'data', filePath)
				unlinkSync(fullPath)
				logDebug(`[SolidStorage] Deleted key: ${key}`)
			}
		} catch (error) {
			logError(`[SolidStorage] Error deleting key ${key}`, error)
			throw error
		}
	}
}

export const createSolidStorage = function (): IStorage {
	return new SolidPersistentStorage()
}

let sharedStorageInstance: IStorage | null = null

export const getSharedSolidStorage = function (): IStorage {
	if (!sharedStorageInstance) {
		sharedStorageInstance = createSolidStorage()
		logInfo('[SolidStorage] Initialized shared persistent storage instance')
	}
	return sharedStorageInstance
}
