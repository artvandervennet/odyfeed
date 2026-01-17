# Final Fix: Remove prompt=consent Parameter

## Problem

Even after fixing the app.json structure, the ActivityPods backend was still throwing:
```
Unknown interaction Interaction {
  ...
  prompt: { name: 'consent', reasons: [ 'consent_prompt' ], details: {} },
  ...
}
TypeError [ERR_INVALID_ARG_TYPE]: The "url" argument must be of type string. Received undefined
```

## Root Cause

**ActivityPods does not support the standard OIDC `prompt=consent` parameter** in the way generic OIDC providers do. When we added `prompt=consent` to force the permission screen, ActivityPods tried to handle it but failed because it doesn't know how to process this type of interaction.

ActivityPods has its own built-in application registration and consent flow that is triggered automatically when:
1. It detects a new client_id
2. The clientid.json references an interop:applicationRegistration
3. The app.json contains permission declarations

## The Fix

### Changed in `app/composables/useActivityPodsAuth.ts`:

**Removed:**
```typescript
authUrl.searchParams.set('prompt', 'consent');
authUrl.searchParams.set('scope', 'openid offline_access webid');
```

**Now using:**
```typescript
authUrl.searchParams.set('scope', 'openid webid');
// No prompt parameter
```

### Changed in `server/routes/clientid.json.ts`:

**Removed:**
```typescript
"scope": "openid offline_access webid"
```

**Now using:**
```typescript
"scope": "openid webid"
```

## Why This Works

1. **No prompt parameter**: ActivityPods will use its default consent flow when it detects a new application
2. **Correct scope**: Matches what ActivityPods expects (`openid webid`)
3. **Automatic consent**: When ActivityPods sees a new client_id with an applicationRegistration, it automatically:
   - Fetches the app.json
   - Parses the interop:hasAccessNeedGroup
   - Shows the user a consent screen with the requested permissions
   - Registers the app upon user approval

## How ActivityPods Consent Works

```
1. User clicks login
2. App redirects to ActivityPods authorize endpoint
3. ActivityPods checks if client_id is known
   ├─ Known client → Continue to authorize
   └─ Unknown client → Fetch clientid.json
                       ├─ Has interop:applicationRegistration?
                       │  └─ Yes → Fetch app.json
                       │          └─ Parse permissions
                       │             └─ Show consent screen
                       └─ No → Regular OIDC flow
4. User approves permissions
5. App is registered in user's pod
6. Authorization code issued
7. App exchanges code for tokens
```

## Testing

After this fix, the login flow should:

1. ✅ Not show "Unknown interaction" error
2. ✅ Automatically trigger consent screen when new app detected
3. ✅ Display permissions from app.json
4. ✅ Register app in user's "Registered Apps"
5. ✅ Issue valid tokens upon approval

## Verification Steps

1. **Clear browser storage**
2. **Restart your app** (if using dev server)
3. **Try logging in again**
4. **Check backend logs** - should not show TypeError
5. **You should see** a consent screen from ActivityPods
6. **After accepting** - app should appear in registered apps

## Key Takeaway

**ActivityPods is not a generic OIDC provider.** It has its own extensions for Solid and application interoperability. We should:
- ✅ Use its automatic consent flow (don't force with `prompt=consent`)
- ✅ Use the scopes it supports (`openid webid`, not `offline_access`)
- ✅ Rely on its interop application registration mechanism
- ✅ Let it handle the consent flow based on app.json

## Expected Backend Logs After Fix

Instead of:
```
Unknown interaction Interaction {...}
TypeError [ERR_INVALID_ARG_TYPE]: The "url" argument must be of type string.
```

You should see:
```
[INFO] API: => POST /.oidc/auth/auth/...
[INFO] Application registration detected
[INFO] Displaying consent screen for OdyFeed
[INFO] User granted permissions
[INFO] Authorization code issued
```

---

**Status:** ✅ Fixed - Ready to test

**Action:** Clear browser storage and try logging in again. The consent screen should now appear without errors.
