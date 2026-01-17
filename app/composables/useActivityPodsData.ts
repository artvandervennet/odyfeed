import { useAuthStore } from '~/stores/authStore'
import { useActivityPodsAuth } from '~/composables/useActivityPodsAuth'
import type { ASActivity, ASCollection, ASNote } from '~~/shared/types/activitypub'

export const useActivityPodsData = function () {
	const auth = useAuthStore()
	const { fetchWithAuth } = useActivityPodsAuth()

	const fetchInboxActivities = async function (): Promise<ASActivity[]> {
		if (!auth.session || !auth.inbox) {
			throw new Error('Inbox not configured')
		}

		const response = await fetchWithAuth(auth.session, auth.inbox)

		if (!response.ok) {
			throw new Error(`Failed to fetch inbox: ${response.statusText}`)
		}

		const inboxCollection = await response.json() as ASCollection<ASActivity | string>
		const items = inboxCollection.orderedItems || inboxCollection.items || []

		const activities: ASActivity[] = []
		for (const item of items) {
			if (typeof item === 'string') {
				try {
					const activityResponse = await fetchWithAuth(auth.session, item)
					if (activityResponse.ok) {
						const activity = await activityResponse.json()
						activities.push(activity)
					}
				} catch (error) {
					console.error('Failed to fetch inbox activity:', item, error)
				}
			} else {
				activities.push(item)
			}
		}

		return activities
	}

	const fetchOutboxItems = async function (): Promise<ASNote[]> {
		if (!auth.session || !auth.outbox) {
			throw new Error('Outbox not configured')
		}

		const response = await fetchWithAuth(auth.session, auth.outbox)

		if (!response.ok) {
			throw new Error(`Failed to fetch outbox: ${response.statusText}`)
		}

		const outboxCollection = await response.json() as ASCollection<string>
		const itemUrls = outboxCollection.orderedItems || outboxCollection.items || []

		const items: ASNote[] = []
		for (const url of itemUrls) {
			try {
				const itemResponse = await fetchWithAuth(auth.session, url)
				if (itemResponse.ok) {
					const item = await itemResponse.json()
					if (item.type === 'Note' || item.type === 'Create') {
						items.push(item.object || item)
					}
				}
			} catch (error) {
				console.error('Failed to fetch outbox item:', url, error)
			}
		}

		return items
	}

	const postToOutbox = async function (activity: ASActivity): Promise<void> {
		if (!auth.session || !auth.outbox) {
			throw new Error('Outbox not configured')
		}

		const response = await fetchWithAuth(auth.session, auth.outbox, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/ld+json',
			},
			body: JSON.stringify(activity),
		})

		if (!response.ok) {
			const errorText = await response.text()
			throw new Error(`Failed to post to outbox: ${response.statusText} - ${errorText}`)
		}
	}

	const fetchResource = async function (url: string): Promise<any> {
		if (!auth.session) {
			throw new Error('Not authenticated')
		}

		const response = await fetchWithAuth(auth.session, url)

		if (!response.ok) {
			throw new Error(`Failed to fetch resource: ${response.statusText}`)
		}

		return await response.json()
	}

	return {
		fetchInboxActivities,
		fetchOutboxItems,
		postToOutbox,
		fetchResource,
	}
}
