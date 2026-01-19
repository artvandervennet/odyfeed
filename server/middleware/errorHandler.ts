import { logError } from '~~/server/utils/logger'

export default defineEventHandler((event) => {
	event.node.res.on('finish', () => {
		if (event.node.res.statusCode >= 500) {
			logError(`[${event.method}] ${event.path} - ${event.node.res.statusCode}`)
		}
	})
})
