# ActivityPods Registration Testing Guide

## What Was Fixed

### Critical Changes Made:

1. **Added `prompt=consent` to OAuth flow** - Forces ActivityPods to show the permission consent screen every time
2. **Fixed app.json structure** - Corrected namespace declarations and JSON-LD format
3. **Used full URIs** - Changed from prefixed URIs like `as:Inbox` to full URIs like `https://www.w3.org/ns/activitystreams#Inbox`
4. **Fixed hasAccessNeedGroup** - Changed from array to object as per spec
5. **Added debug logging** - Console logs to track the authentication flow

## Testing Steps

### 1. Restart Development Server

```bash
# Stop the current server (Ctrl+C)
pnpm dev
```

### 2. Clear Browser Data

Before testing, clear:
- Session Storage
- Local Storage
- Cookies for localhost:3000

Or use an incognito/private window.

### 3. Verify Endpoints

Open these URLs in your browser to verify they return valid JSON:

**Client ID Document:**
```
http://localhost:3000/clientid.json
```

Expected to see:
```json
{
  "@context": [...],
  "client_id": "http://localhost:3000/clientid.json",
  "client_name": "OdyFeed",
  "interop:applicationDeveloperAccount": "https://vandervennet.art",
  "interop:applicationRegistration": "http://localhost:3000/app.json",
  ...
}
```

**Application Registration:**
```
http://localhost:3000/app.json
```

Expected to see:
```json
{
  "@context": [...],
  "@id": "http://localhost:3000/app.json",
  "@type": "interop:Application",
  "interop:hasAccessNeedGroup": {
    "@type": "interop:AccessNeedGroup",
    "interop:hasAccessNeed": [
      {
        "interop:accessMode": "acl:Read",
        "interop:registeredShapeTree": "https://www.w3.org/ns/activitystreams#Inbox"
      },
      ...
    ]
  },
  ...
}
```

### 4. Test Login Flow

1. Go to `http://localhost:3000`
2. Click "Login" button
3. Select "VanderVennet ActivityPods" or enter `https://vandervennet.art`
4. Click "Continue"

### 5. Check Console Logs

You should see in the browser console:
```
[ActivityPods Auth] Starting authorization flow
[ActivityPods Auth] Client ID: http://localhost:3000/clientid.json
[ActivityPods Auth] Redirect URI: http://localhost:3000/callback
[ActivityPods Auth] Authorization URL: https://...&prompt=consent
```

**Important:** Verify that the Authorization URL contains `&prompt=consent`

### 6. Permission Consent Screen

After being redirected to your pod provider, you should now see:

✅ **App Registration Screen** with:
- App name: "OdyFeed"
- App description: "A social feed reader for ActivityPods and ActivityPub"
- Permission requests:
  - ✓ Read access to Inbox
  - ✓ Read/Write access to Outbox  
  - ✓ Read access to Profile

### 7. Accept Permissions

Click "Authorize" or "Accept" to grant permissions.

### 8. Verify Registration

After successful login:

1. Go to your pod provider's settings/dashboard
2. Navigate to "Registered Apps" or "Authorized Applications"
3. You should see **OdyFeed** listed with the granted permissions

### 9. Test Functionality

Once logged in:
- Check that your profile loads
- Try liking a post (this will POST to your outbox)
- Check that the activity appears in your pod's outbox
- Verify that likes are distributed to recipients

## Debugging

### If you don't see the permission screen:

1. **Check the authorization URL** - Make sure it contains `&prompt=consent`
2. **Clear pod provider session** - Log out from your pod provider completely
3. **Revoke previous authorizations** - If OdyFeed was previously authorized, revoke it first
4. **Check BASE_URL** - Make sure `.env` has the correct `BASE_URL`

### If permission screen shows but app doesn't register:

1. **Check app.json format** - Visit `/app.json` and validate the JSON-LD structure
2. **Check POD_PROVIDER** - Make sure `.env` has `POD_PROVIDER=https://vandervennet.art`
3. **Verify namespaces** - Ensure `acl` and `foaf` namespaces are in the context

### If you get CORS errors:

The endpoints have CORS headers set, but verify:
```typescript
setResponseHeader(event, 'Access-Control-Allow-Origin', '*');
```

### Console Logging

To see detailed flow:
- Open browser DevTools
- Go to Console tab
- Filter for "ActivityPods" to see auth flow logs
- Filter for "API" to see activity posting logs
- Filter for "useLikeMutation" to see mutation lifecycle

## Expected Behavior After Fix

### ✅ Before Login:
- User clicks Login
- Sees provider selection (VanderVennet ActivityPods as default)
- Clicks Continue

### ✅ During OAuth:
- Redirected to pod provider
- **NEW:** Sees permission consent screen
- Sees requested permissions listed
- Can accept or deny

### ✅ After Login:
- Redirected back to app
- Profile loads automatically
- Inbox/outbox URLs detected
- App appears in pod's "Registered Apps"

### ✅ When Using App:
- Liking a post POSTs to user's outbox
- Pod provider distributes to recipient's inbox
- Activities are properly authenticated with access token
- Token refreshes automatically when needed

## Troubleshooting Matrix

| Symptom | Likely Cause | Solution |
|---------|--------------|----------|
| No permission screen | Missing `prompt=consent` | Check line 64 in useActivityPodsAuth.ts |
| App not in registered apps | Invalid app.json structure | Verify hasAccessNeedGroup is object, not array |
| "Invalid client" error | Client ID not reachable | Check /clientid.json is accessible |
| CORS error on app.json | Missing CORS headers | Verify Access-Control-Allow-Origin header |
| Permissions not requested | Wrong registeredShapeTree | Use full URIs, not prefixed versions |

## Success Criteria

You'll know it's working when:

1. ✅ Console shows authorization URL with `&prompt=consent`
2. ✅ Pod provider shows permission consent screen
3. ✅ Screen lists specific permissions (Inbox read, Outbox read/write, Profile read)
4. ✅ After accepting, app appears in pod's registered apps list
5. ✅ Liking a post successfully POSTs to outbox
6. ✅ Activities are delivered to recipients

## Next Steps

After successful registration:

1. Test posting activities (likes, replies)
2. Check inbox for incoming activities
3. Verify outbox contains your activities
4. Test with multiple users/pods
5. Implement inbox polling for notifications

## Resources

- [ActivityPods App Framework](https://docs.activitypods.org/app-framework/)
- [Solid-OIDC Primer](https://solid.github.io/solid-oidc/primer/)
- [ActivityStreams Vocabulary](https://www.w3.org/TR/activitystreams-vocabulary/)
- [Interoperability Spec](http://www.w3.org/ns/solid/interop)
