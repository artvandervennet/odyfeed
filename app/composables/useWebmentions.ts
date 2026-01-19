import { useSiteWebmentionsQuery } from '~/queries/webmentions'
import type { Webmention } from '~~/shared/types/webmention'

export const useWebmentions = function () {
	const { data: webmentions, isLoading } = useSiteWebmentionsQuery()

	const webmentionCount = computed(() => webmentions.value?.total || 0)

	const hasWebmentions = computed(() => webmentionCount.value > 0)

	const recentWebmentions = computed((): Webmention[] => {
		if (!webmentions.value?.items) return []
		return webmentions.value.items.slice(0, 3)
	})

	return {
		webmentions,
		isLoading,
		webmentionCount,
		hasWebmentions,
		recentWebmentions,
	}
}
