import { createDataStorage } from '~~/server/utils/fileStorage'
import { fetchAndParseMicroformats } from '~~/server/utils/microformats'
import type { WebmentionRequest } from '~~/shared/types/webmention'
import type { ASNote, ASCollection, WebmentionObject } from '~~/shared/types/activitypub'
import { FILE_PATHS, ACTIVITY_TYPES } from '~~/shared/constants'

const WEBMENTIONS_DIR = 'webmentions'

export default defineEventHandler(async (event) => {
  const body = await readBody<WebmentionRequest>(event)

  if (!body.source || !body.target) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing source or target',
    })
  }

  const { source, target } = body

  if (!isValidUrl(source) || !isValidUrl(target)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid URL format',
    })
  }

  const baseUrl = process.baseURL || "http://localhost:3000/"
  if (!target.startsWith(baseUrl)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Target must be on this site',
    })
  }

  const storage = createDataStorage()

  const parsedData = await fetchAndParseMicroformats(source, target)

  if (!parsedData || !parsedData.verified) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Source does not link to target',
    })
  }

  const webmentionObject: WebmentionObject = {
    '@context': 'https://www.w3.org/ns/activitystreams',
    type: 'Webmention',
    id: generateWebmentionId(),
    source,
    webmentionType: parsedData.type || 'mention',
    author: parsedData.author ? {
      type: 'Person',
      name: parsedData.author.name,
      url: parsedData.author.url,
      photo: parsedData.author.photo,
    } : undefined,
    content: parsedData.content?.text,
    published: parsedData.published,
    received: new Date().toISOString(),
  }

  const postPath = extractPostPath(target)

  if (postPath) {
    processPostWebmention(postPath, webmentionObject, source, storage)
  } else {
    processSiteWebmention(webmentionObject, source, target, storage)
  }

  setResponseStatus(event, 202)
  return {
    success: true,
    message: 'Webmention accepted',
  }
})

const processPostWebmention = function (
  postPath: string,
  webmentionObject: WebmentionObject,
  source: string,
  storage: ReturnType<typeof createDataStorage>
): void {
  const post = storage.read<ASNote>(postPath)

  if (!post.id) {
    return
  }

  if (!post.webmentions) {
    post.webmentions = {
      id: `${post.id}/webmentions`,
      type: ACTIVITY_TYPES.ORDERED_COLLECTION,
      totalItems: 0,
      orderedItems: [],
    }
  }

  const webmentionsCollection = post.webmentions as ASCollection<WebmentionObject>
  const items = webmentionsCollection.orderedItems || []

  const existingIndex = items.findIndex((wm) => wm.source === source)

  if (existingIndex >= 0) {
    items[existingIndex] = webmentionObject
  } else {
    items.push(webmentionObject)
  }

  webmentionsCollection.totalItems = items.length
  webmentionsCollection.orderedItems = items

  storage.write(postPath, post, { pretty: true })
}

const processSiteWebmention = function (
  webmentionObject: WebmentionObject,
  source: string,
  target: string,
  storage: ReturnType<typeof createDataStorage>
): void {
  const storagePath = `${WEBMENTIONS_DIR}/site.json`
  const existingData = storage.read<{ items: any[] }>(storagePath)

  const items = existingData.items || []

  const legacyWebmention = {
    id: webmentionObject.id,
    source,
    target,
    type: webmentionObject.webmentionType,
    verified: true,
    received: webmentionObject.received,
    author: webmentionObject.author ? {
      name: webmentionObject.author.name,
      url: webmentionObject.author.url,
      photo: webmentionObject.author.photo,
    } : undefined,
    content: webmentionObject.content ? { text: webmentionObject.content } : undefined,
    published: webmentionObject.published,
  }

  const existingIndex = items.findIndex((wm) => wm.source === source && wm.target === target)

  if (existingIndex >= 0) {
    items[existingIndex] = legacyWebmention
  } else {
    items.push(legacyWebmention)
  }

  storage.write(storagePath, { items }, { pretty: true })
}

const extractPostPath = function (targetUrl: string): string | null {
  try {
    const url = new URL(targetUrl)
    const parts = url.pathname.split('/').filter(Boolean)

    const actorsIndex = parts.indexOf('actors')
    if (actorsIndex === -1) {
      return null
    }

    const statusIndex = parts.indexOf('status', actorsIndex)

    if (statusIndex < 0 || statusIndex + 1 >= parts.length) {
      return null
    }

    const username = parts[actorsIndex + 1]
    const statusId = parts[statusIndex + 1]

    return `${FILE_PATHS.POSTS_DIR}/${username}/${statusId}.jsonld`
  } catch (error) {
    console.error('Error parsing post URL:', error)
    return null
  }
}

const isValidUrl = function (url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

const generateWebmentionId = function (): string {
  return `wm-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

