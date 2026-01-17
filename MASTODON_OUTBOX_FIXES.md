# Mastodon Outbox Compatibility Fixes

## Changes Made

### 1. Updated `shared/constants.ts`
- Added `ACTIVITYPUB_CONTEXT` export with extended Mastodon-compatible context
- Includes `ostatus`, `toot`, `sensitive`, `conversation`, etc.

### 2. Updated `server/api/actors/[username]/outbox.get.ts`
**Key changes:**
- Added HTML formatting for post content (wraps text in `<p>` tags)
- Added extended ActivityPub context (`ACTIVITYPUB_CONTEXT`)
- Added `prev` pagination link to OrderedCollectionPage
- Enhanced Create activity objects with:
  - `url`: Web link to the status
  - `sensitive`: false (for content warnings)
  - `atomUri`: Original post ID
  - `inReplyToAtomUri`: null (for threading)
  - `conversation`: Unique conversation ID
  - `context`: Same as conversation (for thread grouping)
  - `attachment`: Empty array (for media)
  - `tag`: Empty array (for mentions/hashtags)
  - `replies`: Collection with proper structure

### 3. Updated `server/api/actors/[username]/status/[statusId].get.ts`
- Applied same HTML formatting and Mastodon properties to individual status endpoint
- Ensures consistency across all endpoints

### 4. Updated `shared/types/activitypub.ts`
- Extended `ASNote` interface with optional Mastodon properties:
  - `sensitive?: boolean`
  - `atomUri?: string`
  - `inReplyToAtomUri?: string | null`
  - `conversation?: string`
  - `context?: string`
  - `attachment?: any[]`
  - `tag?: any[]`

## What Was Fixed

### Before
```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "id": "https://odyfeed.../outbox?page=true",
  "type": "OrderedCollectionPage",
  "totalItems": 3,
  "partOf": "https://odyfeed.../outbox",
  "orderedItems": [
    {
      "id": ".../activity",
      "type": "Create",
      "object": {
        "content": "Plain text content...",
        ...
      }
    }
  ]
}
```

### After
```json
{
  "@context": [
    "https://www.w3.org/ns/activitystreams",
    {
      "ostatus": "http://ostatus.org#",
      "conversation": "ostatus:conversation",
      "sensitive": "as:sensitive",
      "toot": "http://joinmastodon.org/ns#",
      ...
    }
  ],
  "id": "https://odyfeed.../outbox?page=true",
  "type": "OrderedCollectionPage",
  "totalItems": 3,
  "prev": "https://odyfeed.../outbox?min_id=0&page=true",
  "partOf": "https://odyfeed.../outbox",
  "orderedItems": [
    {
      "id": ".../activity",
      "type": "Create",
      "object": {
        "content": "<p>HTML formatted content...</p>",
        "url": "https://odyfeed.../status/...",
        "sensitive": false,
        "conversation": "https://odyfeed.../contexts/...",
        "attachment": [],
        "tag": [],
        "replies": {
          "id": ".../replies",
          "type": "Collection",
          "totalItems": 0,
          "first": ".../replies?page=true"
        },
        ...
      }
    }
  ]
}
```

## Testing

### 1. Check the Outbox Collection
```bash
curl -H "Accept: application/activity+json" \
  https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/outbox
```

Should return:
- `first` link to paginated view
- Correct `totalItems` count

### 2. Check the Outbox Page
```bash
curl -H "Accept: application/activity+json" \
  https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/outbox?page=true
```

Should return:
- Extended `@context` with Mastodon namespaces
- `prev` navigation link
- Create activities with enhanced objects
- HTML-formatted content in `<p>` tags
- All Mastodon-specific fields

### 3. Check Individual Status
```bash
curl -H "Accept: application/activity+json" \
  https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/status/01-trojan-horse
```

Should return same Mastodon-compatible fields

### 4. Test in Mastodon
1. Go to your Mastodon profile: `@athena@odyfeed.artvandervennet.ikdoeict.be`
2. Click on "Posts" tab
3. Posts should now be visible!

## Why This Works

Mastodon requires:
1. **HTML content**: Raw text isn't rendered, needs `<p>` tags
2. **Extended context**: Mastodon looks for specific namespaces (ostatus, toot)
3. **Pagination links**: `prev`/`next` for navigation
4. **Additional properties**: `url`, `conversation`, `sensitive`, etc. for proper display
5. **Proper structure**: `replies`, `attachment`, `tag` collections even if empty

## Future Enhancements

Consider adding:
- `contentMap` for internationalization
- Actual pagination with `min_id`/`max_id` support
- Rich `attachment` support for media
- `tag` array with mentions and hashtags
- `inReplyTo` for thread support
