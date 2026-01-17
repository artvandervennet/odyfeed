# ActivityPods Integration Guide

## Overview

OdyFeed now integrates with ActivityPods following the official [ActivityPods App Framework](https://docs.activitypods.org/app-framework/) specification. This implementation provides proper application registration, inbox/outbox handling, and LDP-based data access.

## Key Changes

### 1. Application Registration

**Files:**
- `server/routes/app.json.ts` - Application registration document
- `server/routes/clientid.json.ts` - Updated client ID with interop namespace

The app now declares required permissions using the `interop:hasAccessNeedGroup` structure:
- Read access to user's inbox
- Read/Write access to user's outbox
- Read access to user's profile

### 2. Authentication Flow

**Files:**
- `app/composables/useActivityPodsAuth.ts` - Updated to use `accessToken` for resource access

**Important:** ActivityPods requires the `accessToken` (not `idToken`) for accessing protected resources like inbox/outbox. The `idToken` is only for identity verification.

### 3. Inbox/Outbox Handling

**Files:**
- `app/api/activities.ts` - Refactored to use LDP pattern
- `app/composables/useActivityPodsData.ts` - New composable for LDP operations
- `app/queries/inbox.ts` - Query for fetching inbox activities
- `server/api/actors/[username]/outbox.post.ts` - Backend outbox POST endpoint

**Pattern Change:**
- **Before:** Manually POST to recipient's inbox + user's outbox
- **After:** POST to user's outbox only; ActivityPods automatically delivers to recipient's inbox

This follows the ActivityPods architecture where the pod provider handles activity distribution.

### 4. Data Provider Pattern

**New Composable:** `useActivityPodsData`

Provides methods for:
- `fetchInboxActivities()` - Get all activities from user's inbox
- `fetchOutboxItems()` - Get all items from user's outbox
- `postToOutbox(activity)` - Post activity to outbox (auto-distributes)
- `fetchResource(url)` - Fetch any authenticated resource

### 5. Environment Configuration

**File:** `.env`

```env
BASE_URL=http://localhost:3000
POD_PROVIDER=https://vandervennet.art
```

The `POD_PROVIDER` is used in the application registration to identify the app developer.

## Usage Examples

### Posting a Like Activity

```typescript
import { useLikeMutation } from '~/mutations/like'

const { mutate: likePost } = useLikeMutation()

// Simply call the mutation - it handles everything
likePost(post)
```

The mutation now:
1. Creates Like activity
2. POSTs to user's outbox
3. ActivityPods delivers to recipient's inbox automatically

### Fetching Inbox

```typescript
import { useInboxQuery } from '~/queries/inbox'

const { data: inboxActivities, isLoading } = useInboxQuery()

// Activities include: Likes, Follows, Replies, etc.
```

### Using the Data Provider

```typescript
import { useActivityPodsData } from '~/composables/useActivityPodsData'

const { postToOutbox, fetchInboxActivities } = useActivityPodsData()

// Post a custom activity
await postToOutbox({
  '@context': 'https://www.w3.org/ns/activitystreams',
  type: 'Like',
  actor: auth.webId,
  object: postId,
  to: [recipientId]
})

// Fetch inbox
const activities = await fetchInboxActivities()
```

## Pod Provider Setup

Your application is configured to work with `https://vandervennet.art` as the primary ActivityPods provider.

### Testing with Different Providers

To test with other providers, users can:
1. Click "Use custom provider" in the login modal
2. Enter their pod provider URL (e.g., `https://mypod.store`)
3. Complete the OIDC flow

The app will automatically discover the provider's OIDC configuration and request appropriate permissions.

## Backend Endpoints

### Application Registration
- `GET /app.json` - Application registration document with permissions

### Client ID
- `GET /clientid.json` - OIDC client registration

### Actor Endpoints (for local testing)
- `GET /api/actors/{username}/inbox` - Get inbox collection
- `POST /api/actors/{username}/inbox` - Receive activities
- `GET /api/actors/{username}/outbox` - Get outbox collection
- `POST /api/actors/{username}/outbox` - Post activities

## Security Considerations

1. **Access Tokens:** Always use `accessToken` for resource access, never `idToken`
2. **Token Expiry:** Tokens are automatically refreshed when < 60 seconds from expiry
3. **CORS:** Application registration documents allow CORS for pod provider discovery
4. **Permissions:** Only request necessary permissions in app.json

## Debugging

Enable verbose logging:
```typescript
// All mutations and API calls include detailed console.log statements
// Check browser console for:
// - [API] Activity posting
// - [useLikeMutation] Mutation lifecycle
// - [Token Check] Token refresh operations
```

## Migration Notes

If you were using the old pattern of manual inbox posting, update your code:

**Old:**
```typescript
await sendActivityToInbox(session, targetInbox, activity)
await sendActivityToOutbox(session, userOutbox, activity)
```

**New:**
```typescript
await sendActivityToOutbox(session, userOutbox, activity)
// ActivityPods handles delivery to inbox
```

## Resources

- [ActivityPods Documentation](https://docs.activitypods.org/)
- [App Framework Guide](https://docs.activitypods.org/app-framework/)
- [Solid OIDC Spec](https://solid.github.io/solid-oidc/)
- [ActivityStreams Vocabulary](https://www.w3.org/TR/activitystreams-vocabulary/)

## Troubleshooting

### "Failed to post to outbox"
- Verify user has an ActivityPods pod (not generic Solid)
- Check that outbox URL is properly detected in auth store
- Ensure access token is valid and not expired

### "Inbox not configured"
- Some Solid pods don't have ActivityStreams inbox/outbox
- Use ActivityPods-specific providers like mypod.store or vandervennet.art
- Check browser console for pod capability detection warnings

### "Token expired"
- Tokens are automatically refreshed if < 60 seconds from expiry
- If refresh fails, user needs to log in again
- Check that refresh_token was properly stored in session

## Future Enhancements

- [ ] WebSocket support for real-time inbox updates
- [ ] Collections support (followers, following)
- [ ] Type registry for custom ActivityPods types
- [ ] Notification UI for inbox activities
- [ ] Outbox pagination for users with many posts
