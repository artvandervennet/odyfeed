import {
	getSolidDataset,
	getThing,
	getStringNoLocale,
	getUrlAll,
} from '@inrupt/solid-client'
import { useSolidAuth } from './useSolidAuth'
import { NAMESPACES } from '~~/shared/constants'
import { saveThing, buildActivityThing, buildNoteThing } from '~/utils/solidHelpers'

export const useSolidPodStorage = function () {
	const { session, webId, isLoggedIn } = useSolidAuth()

	const getPodStorageUrl = async function (): Promise<string | null> {
		if (!isLoggedIn.value || !webId.value || !session.value.info.isLoggedIn) {
			return null
		}

		try {
			const profileDataset = await getSolidDataset(webId.value, { fetch: session.value.fetch })
			const profile = getThing(profileDataset, webId.value)

			if (!profile) {
				return null
			}

			const storageUrl = getStringNoLocale(profile, 'http://www.w3.org/ns/pim/space#storage')
			return storageUrl || null
		} catch (error) {
			console.error('[Solid Pod] Failed to get storage URL:', error)
			return null
		}
	}

	const saveActivityToPod = async function (activityUrl: string, activity: any): Promise<boolean> {
		if (!isLoggedIn.value || !session.value.info.isLoggedIn) {
			throw new Error('Not authenticated')
		}

		try {
			const storageUrl = await getPodStorageUrl()
			if (!storageUrl) {
				console.warn('[Solid Pod] No storage URL found, skipping Pod save')
				return false
			}

			const activitiesContainerUrl = `${storageUrl}odyfeed/activities/`
			const activityThing = buildActivityThing(activityUrl, activity, NAMESPACES.ACTIVITYSTREAMS)

			return await saveThing(activitiesContainerUrl, activityUrl, activityThing, session.value.fetch)
		} catch (error) {
			console.error('[Solid Pod] Failed to save activity:', error)
			return false
		}
	}

	const saveLikeToPod = async function (postId: string, likeActivity: any): Promise<boolean> {
		if (!isLoggedIn.value || !session.value.info.isLoggedIn) {
			console.warn('[Solid Pod] Not authenticated, skipping like save')
			return false
		}

		try {
			const storageUrl = await getPodStorageUrl()
			if (!storageUrl) {
				return false
			}

			const likesContainerUrl = `${storageUrl}odyfeed/likes/`
			const likeDocumentUrl = `${likesContainerUrl}${encodeURIComponent(postId)}.ttl`

			const likeThing = buildActivityThing(likeDocumentUrl, likeActivity, NAMESPACES.ACTIVITYSTREAMS)

			return await saveThing(likesContainerUrl, likeDocumentUrl, likeThing, session.value.fetch)
		} catch (error) {
			console.error('[Solid Pod] Failed to save like:', error)
			return false
		}
	}

	const removeLikeFromPod = async function (postId: string): Promise<boolean> {
		if (!isLoggedIn.value || !session.value.info.isLoggedIn) {
			return false
		}

		try {
			const storageUrl = await getPodStorageUrl()
			if (!storageUrl) {
				return false
			}

			const likesContainerUrl = `${storageUrl}odyfeed/likes/`
			const likeDocumentUrl = `${likesContainerUrl}${encodeURIComponent(postId)}.ttl`

			await session.value.fetch(likeDocumentUrl, {
				method: 'DELETE',
			})

			return true
		} catch (error) {
			console.error('[Solid Pod] Failed to remove like:', error)
			return false
		}
	}

	const getLikesFromPod = async function (): Promise<string[]> {
		if (!isLoggedIn.value || !session.value.info.isLoggedIn) {
			return []
		}

		try {
			const storageUrl = await getPodStorageUrl()
			if (!storageUrl) {
				return []
			}

			const likesContainerUrl = `${storageUrl}odyfeed/likes/`

			try {
				const dataset = await getSolidDataset(likesContainerUrl, { fetch: session.value.fetch })
				const containerThing = getThing(dataset, likesContainerUrl)

				if (!containerThing) {
					return []
				}

				return getUrlAll(containerThing, 'http://www.w3.org/ns/ldp#contains')
			} catch {
				return []
			}
		} catch (error) {
			console.error('[Solid Pod] Failed to get likes:', error)
			return []
		}
	}

	const saveReplyToPod = async function (replyId: string, replyActivity: any): Promise<boolean> {
		if (!isLoggedIn.value || !session.value.info.isLoggedIn) {
			return false
		}

		try {
			const storageUrl = await getPodStorageUrl()
			if (!storageUrl) {
				return false
			}

			const repliesContainerUrl = `${storageUrl}odyfeed/replies/`
			const replyDocumentUrl = `${repliesContainerUrl}${Date.now()}-reply.ttl`

			const replyNote = replyActivity.object || replyActivity
			const replyThing = buildNoteThing(replyDocumentUrl, replyNote, NAMESPACES.ACTIVITYSTREAMS)

			return await saveThing(repliesContainerUrl, replyDocumentUrl, replyThing, session.value.fetch)
		} catch (error) {
			console.error('[Solid Pod] Failed to save reply:', error)
			return false
		}
	}

	const getRepliesFromPod = async function (): Promise<any[]> {
		if (!isLoggedIn.value || !session.value.info.isLoggedIn) {
			return []
		}

		try {
			const storageUrl = await getPodStorageUrl()
			if (!storageUrl) {
				return []
			}

			const repliesContainerUrl = `${storageUrl}odyfeed/replies/`

			try {
				await getSolidDataset(repliesContainerUrl, { fetch: session.value.fetch })
				return []
			} catch {
				return []
			}
		} catch (error) {
			console.error('[Solid Pod] Failed to get replies:', error)
			return []
		}
	}

	const getActivitiesFromPod = async function (): Promise<any[]> {
		if (!isLoggedIn.value || !session.value.info.isLoggedIn) {
			return []
		}

		try {
			const storageUrl = await getPodStorageUrl()
			if (!storageUrl) {
				return []
			}

			const activitiesContainerUrl = `${storageUrl}odyfeed/activities/`

			await getSolidDataset(activitiesContainerUrl, { fetch: session.value.fetch })

			return []
		} catch (error) {
			console.error('[Solid Pod] Failed to get activities:', error)
			return []
		}
	}

	return {
		getPodStorageUrl,
		saveActivityToPod,
		getActivitiesFromPod,
		saveLikeToPod,
		removeLikeFromPod,
		getLikesFromPod,
		saveReplyToPod,
		getRepliesFromPod,
	}
}
