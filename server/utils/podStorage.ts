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

		const fileName = slug || `${Date.now()}-${activity.type?.toLowerCase() || 'activity'}.json`

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
	if (!authenticatedFetch) {
		return null
	}

	try {
		const file = await getFile(activityUrl, { fetch: authenticatedFetch })
		const text = await file.text()
		return JSON.parse(text)
	} catch (error) {
		logError(`Failed to get activity from Pod: ${activityUrl}`, error)
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
	if (!authenticatedFetch) {
		return []
	}

	try {
		const dataset = await getSolidDataset(containerUrl, { fetch: authenticatedFetch })
		const urls = getContainedResourceUrlAll(dataset)
		return urls.filter(url => !url.endsWith('/'))
	} catch (error) {
		logError(`Failed to list activities from Pod: ${containerUrl}`, error)
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
		const profileUrl = `${podUrl}${POD_CONTAINERS.PROFILE_CARD}`
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
		logError(`Failed to save actor profile to Pod: ${podUrl}${POD_CONTAINERS.PROFILE_CARD}`, error)
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
