import { createDataStorage } from '~~/server/utils/fileStorage'
import type { WebmentionCollection } from '~~/shared/types/webmention'
import type { ASNote, WebmentionObject } from '~~/shared/types/activitypub'
import { FILE_PATHS } from '~~/shared/constants'

const WEBMENTIONS_DIR = 'webmentions'

export default defineEventHandler((event): WebmentionCollection => {
  const params = getRouterParams(event)
  const path = params.path as string

  const storage = createDataStorage()

  if (path === 'site') {
    const storagePath = `${WEBMENTIONS_DIR}/site.json`
    const data = storage.read<{ items: any[] }>(storagePath)
    const items = data.items || []

    setHeader(event, 'Content-Type', 'application/json')
    setHeader(event, 'Cache-Control', 'public, max-age=60')

    return {
      total: items.length,
      items,
    }
  }

  const pathParts = path.split('/')

  if (pathParts[0] === 'posts' && pathParts.length >= 3) {
    const username = pathParts[1]
    const statusId = pathParts[2]
    const postPath = `${FILE_PATHS.POSTS_DIR}/${username}/${statusId}.jsonld`

    if (!storage.exists(postPath)) {
      setHeader(event, 'Content-Type', 'application/json')
      return {
        total: 0,
        items: [],
      }
    }

    const post = storage.read<ASNote>(postPath)
    const webmentionsCollection = post.webmentions

    if (!webmentionsCollection) {
      setHeader(event, 'Content-Type', 'application/json')
      return {
        total: 0,
        items: [],
      }
    }

    const webmentionObjects = webmentionsCollection.orderedItems || []

    const items = webmentionObjects.map((wm: WebmentionObject) => ({
      id: wm.id,
      source: wm.source,
      target: post.id,
      type: wm.webmentionType,
      verified: true,
      received: wm.received,
      author: wm.author ? {
        name: wm.author.name,
        url: wm.author.url,
        photo: wm.author.photo,
      } : undefined,
      content: wm.content ? { text: wm.content } : undefined,
      published: wm.published,
    }))

    setHeader(event, 'Content-Type', 'application/json')
    setHeader(event, 'Cache-Control', 'public, max-age=60')

    return {
      total: items.length,
      items,
    }
  }

  setHeader(event, 'Content-Type', 'application/json')
  return {
    total: 0,
    items: [],
  }
})
