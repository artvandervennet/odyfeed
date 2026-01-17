export interface Webmention {
  id: string
  source: string
  target: string
  type: 'like' | 'comment' | 'mention' | 'repost'
  verified: boolean
  received: string
  author?: {
    name?: string
    url?: string
    photo?: string
  }
  content?: {
    text?: string
    html?: string
  }
  published?: string
}

export interface WebmentionCollection {
  total: number
  items: Webmention[]
}

export interface WebmentionRequest {
  source: string
  target: string
}
