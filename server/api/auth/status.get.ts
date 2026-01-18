export default defineEventHandler(async (event) => {
	const auth = event.context.auth

	return {
		authenticated: !!auth?.webId,
		webId: auth?.webId || null,
		username: auth?.username || null,
		hasValidToken: auth?.hasValidToken || false,
		podUrl: auth?.podUrl || null,
	}
})
