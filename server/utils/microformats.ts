import type { Webmention } from '~~/shared/types/webmention'

interface MicroformatEntry {
  type: string[]
  properties: {
    name?: string[]
    content?: Array<{ html?: string; value?: string }>
    summary?: string[]
    author?: Array<{
      type: string[]
      properties: {
        name?: string[]
        url?: string[]
        photo?: string[]
      }
    }>
    published?: string[]
    url?: string[]
    'in-reply-to'?: string[]
    'like-of'?: string[]
    'repost-of'?: string[]
  }
}

interface MicroformatResponse {
  items: MicroformatEntry[]
}

export const fetchAndParseMicroformats = async function (
  sourceUrl: string,
  targetUrl: string
): Promise<Partial<Webmention> | null> {
  try {
    const response = await fetch(sourceUrl, {
      headers: {
        'User-Agent': 'OdyFeed/1.0 (Webmention)',
      },
    })

    if (!response.ok) {
      return null
    }

    const html = await response.text()

    if (!html.includes(targetUrl)) {
      return null
    }

    const mfData = parseMicroformats(html)

    if (!mfData || !mfData.items || mfData.items.length === 0) {
      return {
        type: 'mention',
        verified: true,
      }
    }

    const entry = mfData.items.find((item) =>
      item.type.includes('h-entry')
    ) || mfData.items[0]

    const author = extractAuthor(entry)
    const content = extractContent(entry)
    const type = determineWebmentionType(entry, targetUrl)
    const published = entry.properties.published?.[0]

    return {
      type,
      verified: true,
      author,
      content,
      published,
    }
  } catch (error) {
    console.error('Error fetching microformats:', error)
    return null
  }
}

const parseMicroformats = function (html: string): MicroformatResponse | null {
  const hEntryRegex = /<[^>]+class="[^"]*h-entry[^"]*"[^>]*>/i
  const hasHEntry = hEntryRegex.test(html)

  if (!hasHEntry) {
    return null
  }

  const items: MicroformatEntry[] = []
  const entryMatch = html.match(/<article[^>]+class="[^"]*h-entry[^"]*"[^>]*>[\s\S]*?<\/article>/i)

  if (entryMatch) {
    const entryHtml = entryMatch[0]
    items.push(parseEntry(entryHtml))
  }

  return { items }
}

const parseEntry = function (html: string): MicroformatEntry {
  const properties: MicroformatEntry['properties'] = {}

  const nameMatch = html.match(/<[^>]+class="[^"]*p-name[^"]*"[^>]*>(.*?)<\/[^>]+>/i)
  if (nameMatch) properties.name = [nameMatch[1].trim()]

  const contentMatch = html.match(/<[^>]+class="[^"]*e-content[^"]*"[^>]*>(.*?)<\/[^>]+>/is)
  if (contentMatch) {
    properties.content = [{ html: contentMatch[1].trim(), value: contentMatch[1].replace(/<[^>]+>/g, '').trim() }]
  }

  const summaryMatch = html.match(/<[^>]+class="[^"]*p-summary[^"]*"[^>]*>(.*?)<\/[^>]+>/i)
  if (summaryMatch) properties.summary = [summaryMatch[1].trim()]

  const publishedMatch = html.match(/<time[^>]+class="[^"]*dt-published[^"]*"[^>]*datetime="([^"]+)"/i)
  if (publishedMatch) properties.published = [publishedMatch[1]]

  const urlMatch = html.match(/<a[^>]+class="[^"]*u-url[^"]*"[^>]*href="([^"]+)"/i)
  if (urlMatch) properties.url = [urlMatch[1]]

  const inReplyToMatch = html.match(/<a[^>]+class="[^"]*u-in-reply-to[^"]*"[^>]*href="([^"]+)"/i)
  if (inReplyToMatch) properties['in-reply-to'] = [inReplyToMatch[1]]

  const likeOfMatch = html.match(/<a[^>]+class="[^"]*u-like-of[^"]*"[^>]*href="([^"]+)"/i)
  if (likeOfMatch) properties['like-of'] = [likeOfMatch[1]]

  const repostOfMatch = html.match(/<a[^>]+class="[^"]*u-repost-of[^"]*"[^>]*href="([^"]+)"/i)
  if (repostOfMatch) properties['repost-of'] = [repostOfMatch[1]]

  const authorMatch = html.match(/<[^>]+class="[^"]*p-author[^"]*h-card[^"]*"[^>]*>(.*?)<\/[^>]+>/is)
  if (authorMatch) {
    const authorHtml = authorMatch[1]
    const authorName = authorHtml.match(/<[^>]+class="[^"]*p-name[^"]*"[^>]*>(.*?)<\/[^>]+>/i)?.[1]
    const authorUrl = authorHtml.match(/<a[^>]+class="[^"]*u-url[^"]*"[^>]*href="([^"]+)"/i)?.[1]
    const authorPhoto = authorHtml.match(/<img[^>]+class="[^"]*u-photo[^"]*"[^>]*src="([^"]+)"/i)?.[1]

    if (authorName || authorUrl) {
      properties.author = [{
        type: ['h-card'],
        properties: {
          ...(authorName && { name: [authorName.trim()] }),
          ...(authorUrl && { url: [authorUrl] }),
          ...(authorPhoto && { photo: [authorPhoto] }),
        },
      }]
    }
  }

  return {
    type: ['h-entry'],
    properties,
  }
}

const extractAuthor = function (entry: MicroformatEntry) {
  const author = entry.properties.author?.[0]
  if (!author) return undefined

  return {
    name: author.properties.name?.[0],
    url: author.properties.url?.[0],
    photo: author.properties.photo?.[0],
  }
}

const extractContent = function (entry: MicroformatEntry) {
  const content = entry.properties.content?.[0]
  const summary = entry.properties.summary?.[0]

  if (!content && !summary) return undefined

  return {
    html: content?.html,
    text: content?.value || summary,
  }
}

const determineWebmentionType = function (
  entry: MicroformatEntry,
  targetUrl: string
): 'like' | 'comment' | 'mention' | 'repost' {
  if (entry.properties['like-of']?.includes(targetUrl)) {
    return 'like'
  }

  if (entry.properties['repost-of']?.includes(targetUrl)) {
    return 'repost'
  }

  if (entry.properties['in-reply-to']?.includes(targetUrl)) {
    return 'comment'
  }

  const hasContent = entry.properties.content?.[0]?.value || entry.properties.summary?.[0]
  if (hasContent && hasContent.length > 50) {
    return 'comment'
  }

  return 'mention'
}
