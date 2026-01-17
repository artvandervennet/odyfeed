# Quick Start Checklist - ActivityPods Registration

## ✅ Implementation Complete!

All critical fixes have been applied to enable proper ActivityPods registration.

## What to Do Now

### Step 1: Restart Development Server
```bash
pnpm dev
```

### Step 2: Clear Browser Data
Open DevTools → Application → Clear storage for `localhost:3000`
- Clear Local Storage
- Clear Session Storage
- Clear Cookies

*Or just open an Incognito/Private window*

### Step 3: Verify Endpoints
Open in browser:
- ✓ http://localhost:3000/app.json
- ✓ http://localhost:3000/clientid.json

Both should return valid JSON.

### Step 4: Test Login
1. Go to http://localhost:3000
2. Click "Login"
3. Select "VanderVennet ActivityPods"
4. Click "Continue"

### Step 5: Check Console
Open browser DevTools → Console

You should see:
```
[ActivityPods Auth] Starting authorization flow
[ActivityPods Auth] Client ID: http://localhost:3000/clientid.json
[ActivityPods Auth] Redirect URI: http://localhost:3000/callback
[ActivityPods Auth] Authorization URL: https://...&prompt=consent
```

**Important:** Verify the URL contains `&prompt=consent`

### Step 6: Permission Screen
You should now see a permission consent screen asking to authorize OdyFeed with:
- ✓ Read access to Inbox
- ✓ Read/Write access to Outbox
- ✓ Read access to Profile

### Step 7: Accept & Verify
1. Click "Authorize" or "Accept"
2. You'll be redirected back to the app
3. Go to your pod provider dashboard
4. Check "Registered Apps" - OdyFeed should be listed!

## What Changed?

### Critical Fix #1: Added `prompt=consent`
**File:** `app/composables/useActivityPodsAuth.ts`
**Line:** 64
```typescript
authUrl.searchParams.set('prompt', 'consent');
```
This forces ActivityPods to show the permission screen.

### Critical Fix #2: Fixed app.json Structure
**File:** `server/routes/app.json.ts`
- Added `acl` and `foaf` namespaces
- Changed `hasAccessNeedGroup` from array to object
- Used full URIs instead of prefixes
- Fixed access mode declarations

### Critical Fix #3: Updated clientid.json
**File:** `server/routes/clientid.json.ts`
- Added `foaf` namespace for consistency

## Troubleshooting

### ❌ No permission screen appears
**Solution:** Check console - authorization URL must contain `&prompt=consent`

### ❌ "Invalid client" error
**Solution:** Verify `/clientid.json` is accessible and returns valid JSON

### ❌ Permission screen shows but app doesn't register
**Solution:** Verify `/app.json` has proper structure with `acl` and `foaf` namespaces

### ❌ CORS errors
**Solution:** Both endpoints have CORS headers set, but check browser network tab

## Success Indicators

✅ Console logs show authorization flow
✅ Authorization URL contains `&prompt=consent`
✅ Permission consent screen appears
✅ Specific permissions are listed
✅ After login, app appears in "Registered Apps"
✅ Can like posts (POSTs to outbox)
✅ Activities are delivered

## Next Steps After Successful Login

1. **Test Liking a Post**
   - Find a post on the timeline
   - Click the heart/like button
   - Check browser console for API logs

2. **Verify in Pod**
   - Go to your pod provider
   - Navigate to your outbox
   - Verify the Like activity appears

3. **Check Recipient**
   - The Like should appear in the post author's inbox
   - (If testing locally, check `data/actors/{username}/inbox/`)

4. **Test Reply**
   - Reply to a post
   - Verify Create activity in outbox
   - Verify reply appears for the post

## Documentation

- **Full Integration Guide:** `ACTIVITYPODS_INTEGRATION.md`
- **Testing Instructions:** `TESTING_GUIDE.md`
- **Implementation Details:** `IMPLEMENTATION_SUMMARY.md`
- **Auth Details:** `ACTIVITYPODS_AUTH.md`

## Need Help?

1. Check `TESTING_GUIDE.md` for detailed troubleshooting
2. Review browser console logs for errors
3. Verify endpoint responses
4. Check pod provider dashboard

## Environment Variables

Your `.env` file should have:
```env
BASE_URL=http://localhost:3000
POD_PROVIDER=https://vandervennet.art
OPENAI_API_KEY=...
```

All set! ✨

---

**Ready to test?** Start at Step 1 above! 🚀
