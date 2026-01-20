import { defineQuery, useQuery } from '@pinia/colada'
import { useAuthStore } from '~/stores/authStore'
import type { ASActivity, ASCollection } from '~~/shared/types/activitypub'
import { extractCollectionItems } from '~~/shared/types/mappers'
import { queryKeys } from '~/utils/queryKeys'

export const useInboxQuery = defineQuery(() => {
	const auth = useAuthStore()

	return useQuery<ASActivity[]>({
		key: queryKeys.inbox(auth.inbox || ''),
		query: async () => {
			if (!auth.isLoggedIn || !auth.inbox) {
				throw new Error('Inbox not configured')
			}

			const response = await $fetch(auth.inbox, {
				headers: {
					'Accept': 'application/ld+json, application/json',
				},
			})

			if (!response || typeof response !== 'object') {
				throw new Error('Invalid inbox response')
			}

			const inboxCollection = response as ASCollection<ASActivity | string>

			let items = extractCollectionItems(inboxCollection)

			if (items.length === 0 && inboxCollection.first) {
				const firstPageUrl = inboxCollection.first ?? ""

				const firstPageResponse = await $fetch(firstPageUrl, {
					headers: {
						'Accept': 'application/ld+json, application/json',
					},
				})

				if (firstPageResponse && typeof firstPageResponse === 'object') {
					const firstPageCollection = firstPageResponse as ASCollection<ASActivity | string>
					items = extractCollectionItems(firstPageCollection)
				}
			}

			const activities: ASActivity[] = []
			for (const item of items) {
				if (typeof item === 'string') {
					try {
						const activityResponse = await $fetch(item, {
							headers: {
								'Accept': 'application/ld+json, application/json',
							},
						})
						if (activityResponse) {
							activities.push(activityResponse as ASActivity)
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


