# Testing Guide: Like, Reply & Profile Features

## Prerequisites

1. Have an ActivityPods account (e.g., from https://mypod.store)
2. Run the development server: `pnpm dev`
3. Navigate to `http://localhost:3000`

## Test Scenarios

### 1. Login & Profile Setup

1. Click "Login with ActivityPods" button
2. Enter your ActivityPods provider URL (e.g., `https://mypod.store`)
3. Authenticate with your credentials
4. You should be redirected back to the app

**Expected Results:**
- ✅ Your avatar appears in the top-right header
- ✅ Dropdown menu shows your name/username
- ✅ "View Profile" option is available in dropdown

### 2. Like a Post

1. Find a post in the timeline
2. Click the heart icon ❤️

**Expected Results:**
- ✅ Heart icon becomes solid/filled
- ✅ Like count increases by 1
- ✅ Button is disabled briefly during the request
- ✅ Console shows no errors

**Behind the scenes:**
- Like activity is sent to the post author's inbox
- Like activity is added to your outbox
- Query cache is invalidated and refreshes

### 3. Unlike a Post

1. Find a post you've already liked (solid heart)
2. Click the heart icon again

**Expected Results:**
- ✅ Heart icon becomes outline/empty
- ✅ Like count decreases by 1
- ✅ Button is disabled briefly during the request

**Behind the scenes:**
- Undo activity is sent to the post author's inbox
- Undo activity is added to your outbox

### 4. Reply to a Post

1. Find a post in the timeline
2. Click the reply icon 💬
3. Type your reply in the text area
4. Click "Reply" button

**Expected Results:**
- ✅ Reply form appears below the post
- ✅ After submitting, form closes
- ✅ Timeline refreshes
- ✅ Your reply should appear on the post detail page

**Behind the scenes:**
- Create activity with Note object is sent to post author's inbox
- Create activity is added to your outbox
- Reply is linked to parent post via `inReplyTo`

### 5. View Your Profile

1. Click your avatar in the top-right header
2. Select "View Profile" from dropdown

**Expected Results:**
- ✅ Navigates to `/profile` page
- ✅ Shows your profile information:
  - Avatar
  - Display name
  - Username (e.g., @yourname)
  - Bio/summary (if set)
  - WebID URL
- ✅ Shows "Your Posts" section
- ✅ Lists all posts from your outbox
- ✅ Post count is displayed

**Behind the scenes:**
- Fetches your WebID profile using authenticated request
- Fetches your outbox collection
- Fetches individual posts from outbox URLs
- All requests use OAuth access token

### 6. Interact with Posts on Detail Page

1. Navigate to a specific post by clicking on it
2. Try liking/unliking from the detail view
3. Try posting a reply from the detail view

**Expected Results:**
- ✅ Like/unlike works same as timeline
- ✅ Reply form appears and works
- ✅ Replies list updates after posting
- ✅ Reply counts update correctly

## Testing with Local Actors

Since the app has local actors (Odysseus, Athena, Poseidon), you can test interactions:

1. Like one of Odysseus's posts
2. Check the local data: `data/actors/odysseus/inbox/`
3. You should see a new JSON file with your Like activity

Example like file: `{timestamp}-like.jsonld`

## Debug Console Logs

The app logs useful information to the browser console:

- "User profile loaded: {profile data}"
- "ActivityPods outbox detected: {outbox URL}"
- "ActivityPods inbox detected: {inbox URL}"
- "Failed to like post: {error}" (if something goes wrong)
- "User must be logged in to..." (if trying actions while logged out)

## Common Issues

### Issue: "Inbox or outbox not configured"

**Cause**: Your ActivityPods profile doesn't have proper ActivityStreams properties

**Solution**: 
- Check console for validation warnings
- Ensure your pod has `as:inbox` and `as:outbox` properties
- Try the Setup page to configure your pod

### Issue: CORS errors when fetching profile

**Cause**: ActivityPods server doesn't allow cross-origin requests

**Solution**:
- This is expected for external pods
- The access token should provide proper authorization
- Check that the token is being sent in requests (see Network tab)

### Issue: Likes/replies don't appear immediately

**Cause**: Query cache hasn't invalidated yet

**Solution**:
- Refresh the page
- The mutations should automatically invalidate caches
- Check console for any mutation errors

### Issue: "Not authenticated" errors

**Cause**: Session expired or token is invalid

**Solution**:
- Log out and log back in
- Clear browser storage (localStorage, sessionStorage)
- Check that tokens are being stored correctly

## Network Requests to Check

Open DevTools → Network tab and look for:

1. **Like action:**
   - POST to `{target-actor-inbox}` with Like activity
   - POST to `{your-outbox}` with Like activity

2. **Reply action:**
   - POST to `{target-actor-inbox}` with Create activity
   - POST to `{your-outbox}` with Create activity

3. **Profile load:**
   - GET to `{your-webid}` with Authorization header
   - GET to `{your-outbox}` with Authorization header
   - Multiple GETs to individual post URLs

All authenticated requests should have:
- `Authorization: Bearer {access-token}` header
- `Accept: application/ld+json, application/json` header

## Success Indicators

✅ **Full Success:**
- Can like/unlike posts
- Can reply to posts
- Can view own profile
- Profile shows correct information
- Posts appear on profile page
- No console errors during interactions

⚠️ **Partial Success:**
- Interactions work but some profile info is missing
- Some posts don't load
- Minor console warnings (but functionality works)

❌ **Failure:**
- Authentication fails
- Mutations throw errors
- Profile page shows error state
- Activities don't reach inboxes

## Reporting Issues

If you encounter problems, note:
1. What action you were trying
2. Error messages in console
3. Network request status codes
4. Your ActivityPods provider URL
5. Browser and version

## Next Testing Phase

After basic functionality works:
1. Test with multiple users
2. Test reply threads (replies to replies)
3. Test with posts that have many likes
4. Test offline behavior
5. Test with slow network (throttling)
