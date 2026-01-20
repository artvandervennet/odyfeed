import { mf2 } from 'microformats-parser'
import type { Webmention } from '~~/shared/types/webmention'

interface MicroformatEntry {
  type?: string[]
  properties: Record<string, any[]>
  children?: MicroformatEntry[]
  value?: any
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

    const parsedUrl = new URL(sourceUrl)
    const mfData = mf2(html, { baseUrl: `${parsedUrl.protocol}//${parsedUrl.host}` })

    if (!mfData || !mfData.items || mfData.items.length === 0) {
      const fallbackAuthor = extractFallbackAuthor(html, sourceUrl)
      return {
        type: 'mention',
        verified: true,
        author: fallbackAuthor,
      }
    }

    const entry = mfData.items.find((item) =>
      item.type?.includes('h-entry')
    ) || mfData.items[0]

    let author = extractAuthor(entry)

    if (!author || !author.name) {
      const pageAuthor = mfData.items.find((item) =>
        item.type?.includes('h-card')
      )
      if (pageAuthor) {
        author = extractAuthor(pageAuthor)
      }
    }

    if (!author || !author.name) {
      author = extractFallbackAuthor(html, sourceUrl)
    }

    const content = extractContent(entry)
    const type = determineWebmentionType(entry, targetUrl)
    const published = entry.properties?.published?.[0]

    return {
      type,
      verified: true,
      author,
      content,
      published: typeof published === 'string' ? published : undefined,
    }
  } catch (error) {
    logError('Error fetching microformats:', error)
    return null
  }
}

const extractAuthor = function (entry: MicroformatEntry) {
  const authorProp = entry.properties?.author?.[0]

  if (!authorProp) {
    if (entry.type?.includes('h-card')) {
      return {
        name: entry.properties?.name?.[0],
        url: entry.properties?.url?.[0],
        photo: entry.properties?.photo?.[0],
      }
    }
    return undefined
  }

  if (typeof authorProp === 'object' && 'properties' in authorProp) {
    return {
      name: authorProp.properties?.name?.[0],
      url: authorProp.properties?.url?.[0],
      photo: authorProp.properties?.photo?.[0],
    }
  }

  if (typeof authorProp === 'string') {
    return {
      name: authorProp,
    }
  }

  return undefined
}

const extractContent = function (entry: MicroformatEntry) {
  const contentProp = entry.properties?.content?.[0]
  const summary = entry.properties?.summary?.[0]

  if (!contentProp && !summary) return undefined

  if (contentProp && typeof contentProp === 'object' && 'html' in contentProp) {
    return {
      html: contentProp.html,
      text: contentProp.value,
    }
  }

  const textContent = typeof contentProp === 'string' ? contentProp : summary

  return {
    html: undefined,
    text: typeof textContent === 'string' ? textContent : undefined,
  }
}

const extractFallbackAuthor = function (html: string, sourceUrl: string) {
  const metaAuthorMatch = html.match(/<meta[^>]+name=["']author["'][^>]+content=["']([^"']+)["']/i)
  if (metaAuthorMatch?.[1]) {
    return {
      name: metaAuthorMatch[1].trim(),
    }
  }

  const ogSiteNameMatch = html.match(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i)
  if (ogSiteNameMatch?.[1]) {
    return {
      name: ogSiteNameMatch[1].trim(),
    }
  }

  const twitterCreatorMatch = html.match(/<meta[^>]+name=["']twitter:creator["'][^>]+content=["']([^"']+)["']/i)
  if (twitterCreatorMatch?.[1]) {
    return {
      name: twitterCreatorMatch[1].trim().replace(/^@/, ''),
    }
  }

  try {
    const url = new URL(sourceUrl)
    return {
      name: url.hostname.replace(/^www\./, ''),
    }
  } catch {
    return undefined
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
