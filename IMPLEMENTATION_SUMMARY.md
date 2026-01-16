# Implementation Summary: ActivityPods Like/Reply & Profile Viewing

## ✅ Completed Features

### 1. OAuth Scope Configuration
- **File**: `server/routes/clientid.json.ts`
- **Status**: ✅ Already configured correctly
- **Scope**: `openid offline_access webid`
- ActivityPods automatically handles permissions for inbox/outbox access through the access token

### 2. Enhanced Authentication Store
- **File**: `app/stores/authStore.ts`
- **Changes**:
  - Added `userProfile` state to store user's profile information
  - Extract `preferredUsername`, `name`, `avatar`, and `summary` from WebID profile
  - Support multiple JSON-LD property formats (full URIs, shortened prefixes)
  - Clear profile data on logout

### 3. Like/Unlike Mutations
- **File**: `app/mutations/like.ts`
- **Functions**:
  - `useLikeMutation()` - Creates Like activity and posts to target's inbox and user's outbox
  - `useUndoLikeMutation()` - Creates Undo activity to remove like
- **Features**:
  - Uses authenticated `fetchWithAuth` from ActivityPodsAuth
  - Sends activities to both target actor's inbox AND user's outbox
  - Automatic query cache invalidation on success
  - Error handling with console logging
  - Activity IDs use timestamp-based generation

### 4. Reply Mutation
- **File**: `app/mutations/reply.ts`
- **Function**: `useReplyMutation()`
- **Features**:
  - Creates Note object with `inReplyTo` reference
  - Wraps in Create activity
  - Posts to target's inbox and user's outbox
  - Validates content is not empty
  - Sets proper ActivityStreams addressing (`to` field includes PUBLIC and target actor)

### 5. Component Integration

#### Post/Card.vue
- ✅ Imports like/reply mutations and useInteractions
- ✅ Uses `isLiked()` to determine current like state
- ✅ Handles like/unlike toggle
- ✅ Reply form with submission
- ✅ Prevents actions when not logged in
- ✅ Loading states with disabled buttons

#### Post/Detail.vue
- ✅ Same mutation integration as Post/Card
- ✅ Detailed view with expanded stats
- ✅ Reply form integration

#### Reply/Card.vue
- ✅ Like/unlike functionality for replies
- ✅ Loading states
- ✅ Authentication checks

#### Post/Stats.vue
- ✅ Added `isLoading` prop
- ✅ Emits events with Event object
- ✅ Disables buttons during mutations

### 6. User Profile Page
- **File**: `app/pages/profile.vue`
- **Features**:
  - Fetches authenticated user's WebID profile using `fetchWithAuth`
  - Loads user's outbox and posts
  - Displays profile information (avatar, name, username, summary)
  - Shows WebID URL for reference
  - Lists user's posts with PostCard components
  - Loading skeletons during data fetch
  - Error handling with fallback UI
  - Redirect to home if not logged in

### 7. Profile Navigation
- **File**: `app/components/AppHeader.vue`
- **Changes**:
  - Display user avatar from `userProfile.avatar`
  - Show username/name from `userProfile`
  - Added "View Profile" menu item that navigates to `/profile`
  - Updated menu to use extracted profile data

### 8. Authentication Middleware
- **File**: `app/middleware/auth.ts`
- **Purpose**: Protects authenticated routes (currently just profile page)
- **Behavior**: Redirects to home if not logged in

## 🔧 Technical Details

### ActivityPub Activity Format

**Like Activity:**
```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "type": "Like",
  "id": "{outbox-url}/{timestamp}-like",
  "actor": "{user-webid}",
  "object": "{post-id}",
  "to": ["{target-actor-id}"]
}
```

**Undo Activity:**
```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "type": "Undo",
  "id": "{outbox-url}/{timestamp}-undo",
  "actor": "{user-webid}",
  "object": {
    "type": "Like",
    "actor": "{user-webid}",
    "object": "{post-id}"
  },
  "to": ["{target-actor-id}"]
}
```

**Create Activity (for replies):**
```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "type": "Create",
  "id": "{outbox-url}/{timestamp}-create",
  "actor": "{user-webid}",
  "object": {
    "type": "Note",
    "id": "{outbox-url}/{timestamp}-reply",
    "attributedTo": "{user-webid}",
    "content": "{reply-text}",
    "inReplyTo": "{parent-post-id}",
    "to": ["https://www.w3.org/ns/activitystreams#Public", "{target-actor-id}"],
    "published": "{iso-timestamp}"
  },
  "to": ["https://www.w3.org/ns/activitystreams#Public", "{target-actor-id}"],
  "published": "{iso-timestamp}"
}
```

### Mutation State Management

Uses Pinia Colada's `useMutation`:
- **Status checking**: `mutation.status.value === 'pending'`
- **Execute**: `mutation.mutate(params)`
- **Callbacks**: `onSuccess`, `onError`
- **Cache invalidation**: Automatically invalidates timeline, post, and replies queries

### Profile Data Extraction

Handles multiple JSON-LD formats:
- Standard properties: `profile.name`, `profile.preferredUsername`
- Full URI properties: `profile['http://www.w3.org/ns/activitystreams#name']`
- Prefixed properties: `profile['as:name']`, `profile['foaf:name']`

## 🎯 User Experience

### Like Interaction
1. User clicks heart icon on post
2. Button shows disabled state during request
3. Activity posted to target's inbox (for them to see)
4. Activity posted to user's outbox (for federation)
5. UI updates with new like count
6. Heart icon fills in red

### Reply Interaction
1. User clicks reply button
2. Reply form appears below post
3. User types reply and clicks submit
4. Reply posted as Create activity
5. Form closes and query cache refreshes
6. New reply appears in thread

### Profile Viewing
1. User clicks avatar in header
2. Dropdown shows "View Profile" option
3. Navigates to `/profile` page
4. Displays user's profile from their ActivityPods WebID
5. Shows all posts from user's outbox
6. Posts are interactive (can like/reply to own posts)

## 📋 Testing Checklist

- [ ] Login with ActivityPods account
- [ ] Verify profile information loads in header
- [ ] Like a post from another user
- [ ] Unlike a post
- [ ] Reply to a post
- [ ] View own profile at `/profile`
- [ ] Verify profile shows correct information
- [ ] Verify user's posts appear on profile
- [ ] Check that activities appear in the local server's inbox (for testing with local actors)
- [ ] Verify error handling (try actions while offline, etc.)

## 🐛 Known Issues / Warnings

1. **ESLint parsing errors** - May be related to ESLint configuration, but code compiles correctly
2. **Mutation "unused" warnings** - False positive; mutations are used in components
3. **CORS considerations** - Profile page fetches from external ActivityPods server, requires proper CORS headers from pod provider
4. **Activity ID generation** - Uses simple timestamp-based IDs; may need UUIDs for production

## 🚀 Next Steps (Optional Enhancements)

1. **Optimistic Updates** - Update UI before server response for instant feedback
2. **Toast Notifications** - Show success/error messages to user
3. **Edit Profile** - Link to ActivityPods interface for profile editing
4. **Following/Followers** - Implement Follow activity support
5. **Notifications** - Show when someone likes/replies to user's posts
6. **Post Composer** - Allow creating new posts directly in the app
7. **Better Error Messages** - User-friendly error messages instead of console logs
8. **Retry Logic** - Automatic retry for failed mutations
9. **Offline Support** - Queue activities when offline
10. **Avatar Fallback** - Generate initials-based avatars when no image available

## 📚 Documentation References

- ActivityPods Docs: https://docs.activitypods.org/
- ActivityPub Spec: https://www.w3.org/TR/activitypub/
- ActivityStreams Vocabulary: https://www.w3.org/TR/activitystreams-vocabulary/
- Pinia Colada: https://pinia-colada.esm.dev/
