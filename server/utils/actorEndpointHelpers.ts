import type { H3Event } from 'h3'
import { getWebIdFromUsername } from './actorHelpers'
import { ACTIVITYPUB_CONTEXT, ACTIVITY_TYPES } from '~~/shared/constants'
import type { ASCollection } from '~~/shared/types/activitypub'

export interface ActorParams {
	username: string
	statusId?: string
}

export interface UserMapping {
	webId: string
	podUrl: string
	actorId: string
}

export interface CollectionOptions {
	context?: string | string[]
	id: string
	type: typeof ACTIVITY_TYPES.ORDERED_COLLECTION | typeof ACTIVITY_TYPES.ORDERED_COLLECTION_PAGE
	totalItems: number
	first?: string
	partOf?: string
	orderedItems?: string[]
	next?: string
	prev?: string
}

export const validateActorParams = function (event: H3Event, requireStatusId = false): ActorParams {
	const username = getRouterParam(event, 'username')
	const statusId = getRouterParam(event, 'statusId')

	if (!username) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Username is required',
		})
	}

	if (requireStatusId && !statusId) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Username and statusId are required',
		})
	}

	return { username, statusId }
}

export const fetchUserMapping = function (username: string): UserMapping {
	const userMapping = getWebIdFromUsername(username)

	if (!userMapping) {
		throw createError({
			statusCode: 404,
			statusMessage: 'Actor not found',
		})
	}

	return userMapping
}

export const buildCollection = function (options: CollectionOptions): ASCollection<string> {
	const { context, id, type, totalItems, first, partOf, orderedItems, next, prev } = options

	const collection: ASCollection<string> = {
		'@context': context || (ACTIVITYPUB_CONTEXT as unknown as string),
		id,
		type,
		totalItems,
	}

	if (first) collection.first = first
	if (partOf) collection.partOf = partOf
	if (orderedItems) collection.orderedItems = orderedItems
	if (next) collection.next = next
	if (prev) collection.prev = prev

	return collection
}

export const buildCollectionPage = function (
	baseUrl: string,
	items: string[],
	page: number,
	pageSize: number
): { pageItems: string[]; hasNext: boolean; hasPrev: boolean } {
	const startIndex = (page - 1) * pageSize
	const endIndex = startIndex + pageSize
	const pageItems = items.slice(startIndex, endIndex)
	const hasNext = endIndex < items.length
	const hasPrev = page > 1

	return { pageItems, hasNext, hasPrev }
}

export const validatePageParam = function (pageParam: string | undefined): number | null {
	if (!pageParam) {
		return null
	}

	const page = parseInt(pageParam, 10)
	if (isNaN(page) || page < 1) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Invalid page parameter',
		})
	}

	return page
}

export const setActivityPubHeaders = function (event: H3Event, cacheMaxAge = 300): void {
	setHeader(event, 'Content-Type', 'application/activity+json; charset=utf-8')
	setHeader(event, 'Cache-Control', `public, max-age=${cacheMaxAge}`)
}
