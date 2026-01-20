import {
	getSolidDataset,
	createContainerAt,
	saveFileInContainer,
	getFile,
	deleteFile,
	getContainedResourceUrlAll,
} from '@inrupt/solid-client'
import { getAuthenticatedFetch } from './solidSession'
import { logInfo, logError, logDebug } from './logger'
import { generateUUID } from './crypto'
import { POD_CONTAINERS } from '~~/shared/constants'
import { AclPermissionType } from '~~/shared/types/solid'
import { generateAclForPermissionType } from './aclGenerator'

const setContainerAcl = async function (
	containerUrl: string,
	ownerWebId: string,
	permissionType: AclPermissionType,
	authenticatedFetch: typeof fetch
): Promise<boolean> {
	try {
		const aclUrl = `${containerUrl}.acl`
		const aclContent = generateAclForPermissionType(containerUrl, ownerWebId, permissionType)

		const response = await authenticatedFetch(aclUrl, {
			method: 'PUT',
			headers: {
				'Content-Type': 'text/turtle',
			},
			body: aclContent,
		})

		if (response.ok) {
			logInfo(`Set ACL for container: ${containerUrl} (${permissionType})`)
			return true
		} else {
			logError(`Failed to set ACL for ${containerUrl}: ${response.status} ${response.statusText}`)
			return false
		}
	} catch (error) {
		logError(`Error setting ACL for ${containerUrl}`, error)
		return false
	}
}

export const ensurePodContainers = async function (webId: string, podUrl: string): Promise<boolean> {
	const authenticatedFetch = await getAuthenticatedFetch(webId)
	if (!authenticatedFetch) {
		logError(`Cannot authenticate for WebID: ${webId}`)
		return false
	}

	try {
		const containerConfigs = [
			{ url: `${podUrl}${POD_CONTAINERS.SOCIAL}`, permission: AclPermissionType.PublicReadOwnerWrite },
			{ url: `${podUrl}${POD_CONTAINERS.PROFILE}`, permission: AclPermissionType.PublicReadOwnerWrite },
			{ url: `${podUrl}${POD_CONTAINERS.INBOX}`, permission: AclPermissionType.PublicAppendPrivateRead },
			{ url: `${podUrl}${POD_CONTAINERS.OUTBOX}`, permission: AclPermissionType.PublicReadOwnerWrite },
			{ url: `${podUrl}${POD_CONTAINERS.FOLLOWERS}`, permission: AclPermissionType.PublicReadOwnerWrite },
			{ url: `${podUrl}${POD_CONTAINERS.FOLLOWING}`, permission: AclPermissionType.PublicReadOwnerWrite },
			{ url: `${podUrl}${POD_CONTAINERS.ACTIVITIES}`, permission: AclPermissionType.PrivateOwnerOnly },
			{ url: `${podUrl}${POD_CONTAINERS.SETTINGS}`, permission: AclPermissionType.PublicReadOwnerWrite },
		]

		for (const config of containerConfigs) {
			try {
				await createContainerAt(config.url, { fetch: authenticatedFetch })
				logInfo(`Created Pod container: ${config.url}`)
			} catch (error: any) {
				if (error.statusCode === 409 || error.message?.includes('409')) {
					logDebug(`Container already exists: ${config.url}`)
				} else {
					throw error
				}
			}

			await setContainerAcl(config.url, webId, config.permission, authenticatedFetch)
		}

		return true
	} catch (error) {
		logError(`Failed to ensure Pod containers for ${webId}`, error)
		return false
	}
}

export const saveActivityToPod = async function (
	webId: string,
	containerPath: string,
	activity: any,
	slug?: string
): Promise<string | null> {
	const authenticatedFetch = await getAuthenticatedFetch(webId)
	if (!authenticatedFetch) {
		logError(`Cannot authenticate for WebID: ${webId}`)
		return null
	}

	try {
		const activityJson = JSON.stringify(activity, null, 2)
		const blob = new Blob([activityJson], { type: 'application/activity+json' })

		const fileName = slug || `${generateUUID()}.json`

		const savedFile = await saveFileInContainer(
			containerPath,
			blob,
			{
				slug: fileName,
				fetch: authenticatedFetch,
			}
		)

		logInfo(`Activity saved to Pod: ${savedFile.internal_resourceInfo.sourceIri}`)
		return savedFile.internal_resourceInfo.sourceIri
	} catch (error) {
		logError(`Failed to save activity to Pod: ${containerPath}`, error)
		return null
	}
}

export const getActivityFromPod = async function (
	webId: string,
	activityUrl: string
): Promise<any | null> {
	const authenticatedFetch = await getAuthenticatedFetch(webId)

	// Use authenticated fetch if available, otherwise try public access
	const fetchToUse = authenticatedFetch || fetch

	try {
		const file = await getFile(activityUrl, { fetch: fetchToUse })
		const text = await file.text()

		if (!authenticatedFetch) {
			logDebug(`[Pod Storage] Fetched activity via public access: ${activityUrl}`)
		}

		return JSON.parse(text)
	} catch (error: any) {
		// If we used authentication and it failed, try public access as fallback
		if (authenticatedFetch && (error.statusCode === 401 || error.statusCode === 403)) {
			logInfo(`[Pod Storage] Authenticated fetch failed (${error.statusCode}), trying public access: ${activityUrl}`)
			try {
				const file = await getFile(activityUrl, { fetch })
				const text = await file.text()
				logInfo(`[Pod Storage] Public access successful for: ${activityUrl}`)
				return JSON.parse(text)
			} catch (publicError: any) {
				logError(`[Pod Storage] Public access also failed for ${activityUrl}:`, publicError)
				return null
			}
		}

		// Log the original error
		if (error.statusCode === 401 || error.statusCode === 403) {
			logError(`[Pod Storage] Access denied (${error.statusCode}) fetching: ${activityUrl}`)
		} else {
			logError(`Failed to get activity from Pod: ${activityUrl}`, error)
		}
		return null
	}
}

export const deleteActivityFromPod = async function (
	webId: string,
	activityUrl: string
): Promise<boolean> {
	const authenticatedFetch = await getAuthenticatedFetch(webId)
	if (!authenticatedFetch) {
		return false
	}

	try {
		await deleteFile(activityUrl, { fetch: authenticatedFetch })
		logInfo(`Activity deleted from Pod: ${activityUrl}`)
		return true
	} catch (error) {
		logError(`Failed to delete activity from Pod: ${activityUrl}`, error)
		return false
	}
}

export const listActivitiesFromPod = async function (
	webId: string,
	containerUrl: string
): Promise<string[]> {
	const authenticatedFetch = await getAuthenticatedFetch(webId)

	// Use authenticated fetch if available, otherwise try public access
	const fetchToUse = authenticatedFetch || fetch

	try {
		const dataset = await getSolidDataset(containerUrl, { fetch: fetchToUse })
		const urls = getContainedResourceUrlAll(dataset)
		const filtered = urls.filter(url => !url.endsWith('/'))

		if (!authenticatedFetch) {
			logDebug(`[Pod Storage] Listed ${filtered.length} activities via public access from: ${containerUrl}`)
		}

		return filtered
	} catch (error: any) {
		// If we used authentication and it failed, try public access as fallback
		if (authenticatedFetch && (error.statusCode === 401 || error.statusCode === 403)) {
			logInfo(`[Pod Storage] Authenticated listing failed (${error.statusCode}), trying public access: ${containerUrl}`)
			try {
				const dataset = await getSolidDataset(containerUrl, { fetch })
				const urls = getContainedResourceUrlAll(dataset)
				const filtered = urls.filter(url => !url.endsWith('/'))
				logInfo(`[Pod Storage] Public access successful: listed ${filtered.length} activities`)
				return filtered
			} catch (publicError: any) {
				logError(`[Pod Storage] Public access also failed for ${containerUrl}:`, publicError)
				return []
			}
		}

		// Log the original error
		if (error.statusCode === 401 || error.statusCode === 403) {
			logError(`[Pod Storage] Access denied (${error.statusCode}) listing: ${containerUrl}`)
		} else {
			logError(`Failed to list activities from Pod: ${containerUrl}`, error)
		}
		return []
	}
}

export const saveActorProfileToPod = async function (
	webId: string,
	podUrl: string,
	actorProfile: any
): Promise<string | null> {
	const authenticatedFetch = await getAuthenticatedFetch(webId)
	if (!authenticatedFetch) {
		logError(`Cannot authenticate for WebID: ${webId}`)
		return null
	}

	try {
		const profileUrl = `${podUrl}${POD_CONTAINERS.ACTIVITYPUB_PROFILE}`
		const profileJson = JSON.stringify(actorProfile, null, 2)

		const response = await authenticatedFetch(profileUrl, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/ld+json',
			},
			body: profileJson,
		})

		if (response.ok) {
			logInfo(`Actor profile saved to Pod: ${profileUrl}`)
			return profileUrl
		} else {
			logError(`Failed to save profile: ${response.status} ${response.statusText}`)
			return null
		}
	} catch (error) {
		logError(`Failed to save actor profile to Pod: ${podUrl}${POD_CONTAINERS.ACTIVITYPUB_PROFILE}`, error)
		return null
	}
}

export const saveTurtleFileToPod = async function (
	webId: string,
	fileUrl: string,
	turtleContent: string
): Promise<boolean> {
	const authenticatedFetch = await getAuthenticatedFetch(webId)
	if (!authenticatedFetch) {
		logError(`Cannot authenticate for WebID: ${webId}`)
		return false
	}

	try {
		const response = await authenticatedFetch(fileUrl, {
			method: 'PUT',
			headers: {
				'Content-Type': 'text/turtle',
			},
			body: turtleContent,
		})

		if (response.ok) {
			logInfo(`Turtle file saved to Pod: ${fileUrl}`)
			return true
		} else {
			logError(`Failed to save Turtle file to ${fileUrl}: ${response.status} ${response.statusText}`)
			return false
		}
	} catch (error) {
		logError(`Error saving Turtle file to ${fileUrl}`, error)
		return false
	}
}

export const saveTypeIndicesToPod = async function (
	webId: string,
	podUrl: string,
	publicTypeIndex: string,
	privateTypeIndex: string
): Promise<boolean> {
	const publicIndexUrl = `${podUrl}${POD_CONTAINERS.PUBLIC_TYPE_INDEX}`
	const privateIndexUrl = `${podUrl}${POD_CONTAINERS.PRIVATE_TYPE_INDEX}`

	const publicSaved = await saveTurtleFileToPod(webId, publicIndexUrl, publicTypeIndex)
	const privateSaved = await saveTurtleFileToPod(webId, privateIndexUrl, privateTypeIndex)

	if (publicSaved && privateSaved) {
		logInfo(`Type indices saved successfully for ${webId}`)
		return true
	}

	return false
}

export const getProfileCardFromPod = async function (
	webId: string,
	podUrl: string
): Promise<string | null> {
	const authenticatedFetch = await getAuthenticatedFetch(webId)
	if (!authenticatedFetch) {
		logError(`Cannot authenticate for WebID: ${webId}`)
		return null
	}

	try {
		const profileCardUrl = `${podUrl}${POD_CONTAINERS.PROFILE_CARD}`
		const response = await authenticatedFetch(profileCardUrl, {
			headers: {
				'Accept': 'text/turtle',
			},
		})

		if (response.ok) {
			const turtleContent = await response.text()
			logInfo(`Retrieved profile card from Pod: ${profileCardUrl}`)
			return turtleContent
		} else if (response.status === 404) {
			logInfo(`No existing profile card found at ${profileCardUrl}`)
			return null
		} else {
			logError(`Failed to retrieve profile card: ${response.status} ${response.statusText}`)
			return null
		}
	} catch (error) {
		logError(`Error retrieving profile card from ${podUrl}`, error)
		return null
	}
}

export const saveProfileCardToPod = async function (
	webId: string,
	podUrl: string,
	profileCardTurtle: string
): Promise<string | null> {
	const profileCardUrl = `${podUrl}${POD_CONTAINERS.PROFILE_CARD}`
	const saved = await saveTurtleFileToPod(webId, profileCardUrl, profileCardTurtle)

	if (saved) {
		return profileCardUrl
	}

	return null
}

export const getActivityPubProfileFromPod = async function (
	webId: string,
	podUrl: string
): Promise<string | null> {
	const authenticatedFetch = await getAuthenticatedFetch(webId)
	if (!authenticatedFetch) {
		logError(`Cannot authenticate for WebID: ${webId}`)
		return null
	}

	try {
		const activityPubProfileUrl = `${podUrl}${POD_CONTAINERS.ACTIVITYPUB_PROFILE}`
		const response = await authenticatedFetch(activityPubProfileUrl, {
			headers: {
				'Accept': 'text/turtle',
			},
		})

		if (response.ok) {
			const turtleContent = await response.text()
			logInfo(`Retrieved ActivityPub profile from Pod: ${activityPubProfileUrl}`)
			return turtleContent
		} else if (response.status === 404) {
			logInfo(`No existing ActivityPub profile found at ${activityPubProfileUrl}`)
			return null
		} else {
			logError(`Failed to retrieve ActivityPub profile: ${response.status} ${response.statusText}`)
			return null
		}
	} catch (error) {
		logError(`Error retrieving ActivityPub profile from ${podUrl}`, error)
		return null
	}
}

export const saveActivityPubProfileToPod = async function (
	webId: string,
	podUrl: string,
	activityPubProfileTurtle: string
): Promise<string | null> {
	const activityPubProfileUrl = `${podUrl}${POD_CONTAINERS.ACTIVITYPUB_PROFILE}`
	const saved = await saveTurtleFileToPod(webId, activityPubProfileUrl, activityPubProfileTurtle)

	if (saved) {
		logInfo(`ActivityPub profile saved to Pod: ${activityPubProfileUrl}`)
		return activityPubProfileUrl
	}

	return null
}

export const getPodStorageUrl = async function (webId: string): Promise<string | null> {
	try {
		const authenticatedFetch = await getAuthenticatedFetch(webId)
		if (!authenticatedFetch) {
			return null
		}

		const response = await authenticatedFetch(webId, {
			headers: {
				'Accept': 'text/turtle',
			},
		})

		if (!response.ok) {
			return null
		}

		const text = await response.text()
		const storageMatch = text.match(/<http:\/\/www\.w3\.org\/ns\/pim\/space#storage>\s+<([^>]+)>/)

		if (storageMatch && storageMatch[1]) {
			return storageMatch[1]
		}

		const webIdUrl = new URL(webId)
		return `${webIdUrl.protocol}//${webIdUrl.host}/`
	} catch (error) {
		logError(`Failed to get Pod storage URL for ${webId}`, error)
		return null
	}
}

export const savePrivateKeyToPod = async function (
	webId: string,
	podUrl: string,
	privateKey: string
): Promise<boolean> {
	const authenticatedFetch = await getAuthenticatedFetch(webId)
	if (!authenticatedFetch) {
		logError(`Cannot authenticate for WebID: ${webId}`)
		return false
	}

	try {
		const keysUrl = `${podUrl}${POD_CONTAINERS.SETTINGS}keys.json`
		const keyData = JSON.stringify({ privateKey }, null, 2)

		const response = await authenticatedFetch(keysUrl, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: keyData,
		})

		if (response.ok) {
			logInfo(`Private key saved to Pod: ${keysUrl}`)
			return true
		} else {
			logError(`Failed to save private key: ${response.status} ${response.statusText}`)
			return false
		}
	} catch (error) {
		logError(`Failed to save private key to Pod`, error)
		return false
	}
}

export const getPrivateKeyFromPod = async function (
	webId: string,
	podUrl: string
): Promise<string | null> {
	const authenticatedFetch = await getAuthenticatedFetch(webId)
	if (!authenticatedFetch) {
		return null
	}

	try {
		const keysUrl = `${podUrl}${POD_CONTAINERS.SETTINGS}keys.json`
		const file = await getFile(keysUrl, { fetch: authenticatedFetch })
		const text = await file.text()
		const data = JSON.parse(text)
		return data.privateKey || null
	} catch (error) {
		logError(`Failed to get private key from Pod: ${webId}`, error)
		return null
	}
}

export const updateActivityInPod = async function (
	webId: string,
	activityUrl: string,
	updatedActivity: any
): Promise<boolean> {
	const authenticatedFetch = await getAuthenticatedFetch(webId)
	if (!authenticatedFetch) {
		logError(`Cannot authenticate for WebID: ${webId}`)
		return false
	}

	try {
		const activityJson = JSON.stringify(updatedActivity, null, 2)

		const response = await authenticatedFetch(activityUrl, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/activity+json',
			},
			body: activityJson,
		})

		if (response.ok) {
			logInfo(`Activity updated in Pod: ${activityUrl}`)
			return true
		} else {
			logError(`Failed to update activity: ${response.status} ${response.statusText}`)
			return false
		}
	} catch (error) {
		logError(`Failed to update activity in Pod: ${activityUrl}`, error)
		return false
	}
}

export const addLikeToPost = async function (
	webId: string,
	postActivityUrl: string,
	likerActorId: string
): Promise<boolean> {
	try {
		const activity = await getActivityFromPod(webId, postActivityUrl)
		if (!activity) {
			logError(`Post activity not found: ${postActivityUrl}`)
			return false
		}

		let noteToUpdate = activity
		if (activity.type === 'Create' && activity.object) {
			noteToUpdate = activity.object
		}

		if (!noteToUpdate.likes) {
			noteToUpdate.likes = {
				type: 'OrderedCollection',
				totalItems: 0,
				orderedItems: []
			}
		}

		if (!noteToUpdate.likes.orderedItems) {
			noteToUpdate.likes.orderedItems = []
		}

		if (!noteToUpdate.likes.orderedItems.includes(likerActorId)) {
			noteToUpdate.likes.orderedItems.push(likerActorId)
			noteToUpdate.likes.totalItems = (noteToUpdate.likes.totalItems || 0) + 1

			if (activity.type === 'Create') {
				activity.object = noteToUpdate
			}

			const updated = await updateActivityInPod(webId, postActivityUrl, activity)
			if (updated) {
				logInfo(`Added like from ${likerActorId} to post ${postActivityUrl}`)
			}
			return updated
		} else {
			logDebug(`Like from ${likerActorId} already exists on post ${postActivityUrl}`)
			return true
		}
	} catch (error) {
		logError(`Failed to add like to post ${postActivityUrl}`, error)
		return false
	}
}

export const removeLikeFromPost = async function (
	webId: string,
	postActivityUrl: string,
	likerActorId: string
): Promise<boolean> {
	try {
		const activity = await getActivityFromPod(webId, postActivityUrl)
		if (!activity) {
			logError(`Post activity not found: ${postActivityUrl}`)
			return false
		}

		let noteToUpdate = activity
		if (activity.type === 'Create' && activity.object) {
			noteToUpdate = activity.object
		}

		if (!noteToUpdate.likes || !noteToUpdate.likes.orderedItems) {
			logDebug(`No likes collection found on post ${postActivityUrl}`)
			return true
		}

		const index = noteToUpdate.likes.orderedItems.indexOf(likerActorId)
		if (index > -1) {
			noteToUpdate.likes.orderedItems.splice(index, 1)
			noteToUpdate.likes.totalItems = Math.max((noteToUpdate.likes.totalItems || 1) - 1, 0)

			if (activity.type === 'Create') {
				activity.object = noteToUpdate
			}

			const updated = await updateActivityInPod(webId, postActivityUrl, activity)
			if (updated) {
				logInfo(`Removed like from ${likerActorId} from post ${postActivityUrl}`)
			}
			return updated
		} else {
			logDebug(`Like from ${likerActorId} not found on post ${postActivityUrl}`)
			return true
		}
	} catch (error) {
		logError(`Failed to remove like from post ${postActivityUrl}`, error)
		return false
	}
}

export const addReplyToPost = async function (
	webId: string,
	postActivityUrl: string,
	replyNoteId: string
): Promise<boolean> {
	try {
		const activity = await getActivityFromPod(webId, postActivityUrl)
		if (!activity) {
			logError(`Post activity not found: ${postActivityUrl}`)
			return false
		}

		let noteToUpdate = activity
		if (activity.type === 'Create' && activity.object) {
			noteToUpdate = activity.object
		}

		if (!noteToUpdate.replies) {
			noteToUpdate.replies = {
				type: 'OrderedCollection',
				totalItems: 0,
				orderedItems: []
			}
		}

		if (!noteToUpdate.replies.orderedItems) {
			noteToUpdate.replies.orderedItems = []
		}

		if (!noteToUpdate.replies.orderedItems.includes(replyNoteId)) {
			noteToUpdate.replies.orderedItems.push(replyNoteId)
			noteToUpdate.replies.totalItems = (noteToUpdate.replies.totalItems || 0) + 1

			if (activity.type === 'Create') {
				activity.object = noteToUpdate
			}

			const updated = await updateActivityInPod(webId, postActivityUrl, activity)
			if (updated) {
				logInfo(`Added reply ${replyNoteId} to post ${postActivityUrl}`)
			}
			return updated
		} else {
			logDebug(`Reply ${replyNoteId} already exists on post ${postActivityUrl}`)
			return true
		}
	} catch (error) {
		logError(`Failed to add reply to post ${postActivityUrl}`, error)
		return false
	}
}

