import { useIntersectionObserver, useWindowScroll, useWindowSize } from '@vueuse/core'
import type { TimelineResponse } from '~~/shared/types/api'

export const useEventProgress = function (timeline: Ref<TimelineResponse | undefined>) {
	const currentEventIndex = ref(0)
	const eventRefs = ref<Map<string, HTMLElement>>(new Map())

	const registerEventElement = function (eventId: string, element: unknown) {
		const el = element as HTMLElement | null
		if (el && el instanceof HTMLElement) {
			eventRefs.value.set(eventId, el)
			observeElement(eventId, el)
		}
	}

	const unregisterEventElement = function (eventId: string) {
		eventRefs.value.delete(eventId)
	}

	const observeElement = function (eventId: string, element: HTMLElement) {
		const { stop } = useIntersectionObserver(
			element,
			(entries) => {
				const entry = entries[0]
				if (entry && entry.isIntersecting && entry.intersectionRatio > 0.2) {
					const index = timeline.value?.groupedByEvent?.findIndex(
						(group) => group.event.id === eventId
					)
					if (index !== undefined && index >= 0) {
						currentEventIndex.value = index
					}
				}
			},
			{
				threshold: [0, 0.2, 0.4, 0.6, 0.8, 1],
				rootMargin: '-10% 0px -70% 0px',
			}
		)

		return stop
	}

	const totalEvents = computed(() => timeline.value?.groupedByEvent?.length || 0)

	if (import.meta.client) {
		const { y } = useWindowScroll()
		const { height } = useWindowSize()

		watch(y, (val) => {
			const docHeight = document.documentElement.scrollHeight
			if (val + height.value >= docHeight - 50) {
				const total = totalEvents.value
				if (total > 0) {
					currentEventIndex.value = total - 1
				}
			}
		})
	}

	return {
		currentEventIndex,
		totalEvents,
		registerEventElement,
		unregisterEventElement,
	}
}
