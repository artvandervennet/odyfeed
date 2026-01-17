import { defineQuery, useQuery } from '@pinia/colada'
import { useAuthStore } from '~/stores/authStore'
import { useActivityPodsAuth } from '~/composables/useActivityPodsAuth'
import type { ASActivity, ASCollection } from '~~/shared/types/activitypub'

export const useInboxQuery = defineQuery(() => {
	const auth = useAuthStore()
	const { fetchWithAuth } = useActivityPodsAuth()

	return useQuery<ASActivity[]>({
		key: ['inbox', auth.inbox || ''],
		query: async () => {
			if (!auth.session || !auth.inbox) {
				throw new Error('Inbox not configured')
			}

			const response = await fetchWithAuth(auth.session, auth.inbox)

			if (!response.ok) {
				throw new Error('Failed to fetch inbox')
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
		},
		enabled: () => auth.isLoggedIn && !!auth.inbox,
		staleTime: 1000 * 60 * 2,
	})
})
