# Migration Guide: Inrupt to ActivityPods

This document explains the changes made to migrate from Inrupt's Solid client libraries to native ActivityPods-compatible OIDC authentication.

## What Changed

### Dependencies

**Removed:**
- `@inrupt/solid-client-authn-browser` - No longer needed
- Usage of `@inrupt/solid-client` for authentication

**Added:**
- Native browser OIDC implementation using Web Crypto API
- Custom PKCE challenge generation
- JWT parsing utilities

> Note: `@inrupt/solid-client` and `@inrupt/solid-client-authn-browser` are still in `package.json` but no longer used. You can remove them if desired:
> ```bash
> pnpm remove @inrupt/solid-client-authn-browser @inrupt/solid-client
> ```

### Files Changed

#### `app/stores/authStore.ts`
- **Before:** Used `getDefaultSession()`, `login()`, `logout()` from Inrupt
- **After:** Uses `useActivityPodsAuth()` composable
- Session type changed from `Session` to `AuthSession`
- Removed dependency on `@inrupt/solid-client-authn-browser`

#### `app/composables/useSolidAuth.ts`
- **Status:** Commented out (not deleted for reference)
- No longer used in the application

#### `nuxt.config.ts`
- Changed `ODYSSEY_BASE_URL` to `BASE_URL` in runtime config
- Added fallback: `BASE_URL || 'http://localhost:3000'`

### New Files

1. **`public/clientid.json`** - OIDC client registration document (replaces dynamic registration)
2. **`app/types/oidc.ts`** - TypeScript interfaces for OIDC flow
3. **`app/utils/oidc.ts`** - PKCE and JWT utilities
4. **`app/composables/useActivityPodsAuth.ts`** - Main authentication logic
5. **`app/pages/callback.vue`** - OAuth callback handler
6. **`ACTIVITYPODS_AUTH.md`** - Comprehensive authentication documentation

## API Changes

### Authentication

**Before (Inrupt):**
```typescript
import { login, logout, getDefaultSession } from "@inrupt/solid-client-authn-browser"

// Login
await login({
  oidcIssuer: provider,
  redirectUrl: window.location.origin,
  clientName: "OdyFeed",
})

// Get session
const session = getDefaultSession()
if (session.info.isLoggedIn) {
  const webId = session.info.webId
}

// Fetch with auth
const response = await session.fetch(url)
```

**After (ActivityPods):**
```typescript
import { useAuthStore } from '~/stores/authStore'
import { useActivityPodsAuth } from '~/composables/useActivityPodsAuth'

const auth = useAuthStore()
const { fetchWithAuth } = useActivityPodsAuth()

// Login
await auth.login(provider)

// Get session
if (auth.isLoggedIn) {
  const webId = auth.webId
  const session = auth.session
}

// Fetch with auth
if (auth.session) {
  const response = await fetchWithAuth(auth.session, url)
}
```

### Session Structure

**Before:**
```typescript
interface Session {
  info: {
    isLoggedIn: boolean
    webId: string
  }
  fetch: (url: string, options?: RequestInit) => Promise<Response>
}
```

**After:**
```typescript
interface AuthSession {
  webId: string
  idToken: string
  accessToken: string
  refreshToken?: string
  expiresAt: number
  issuer: string
}
```

## Feature Comparison

| Feature | Inrupt | ActivityPods |
|---------|--------|--------------|
| Authorization Flow | Authorization Code | Authorization Code + PKCE |
| Token Type | DPoP-bound | Bearer (ID token) |
| Client Auth | Dynamic registration | Static clientid.json |
| Token Refresh | Automatic | Manual (implemented) |
| Session Storage | Library-managed | sessionStorage |
| DPoP Support | ✅ Yes | ❌ Not yet (future) |
| ActivityStreams | ❌ No | ✅ Yes |

## Breaking Changes

### 1. Session Access

```typescript
// ❌ OLD - No longer works
const session = getDefaultSession()
await session.fetch(url)

// ✅ NEW - Use store and composable
const auth = useAuthStore()
const { fetchWithAuth } = useActivityPodsAuth()
if (auth.session) {
  await fetchWithAuth(auth.session, url)
}
```

### 2. Login Flow

```typescript
// ❌ OLD
import { login } from "@inrupt/solid-client-authn-browser"
await login({ oidcIssuer, redirectUrl, clientName })

// ✅ NEW
const auth = useAuthStore()
await auth.login(oidcIssuer)
```

### 3. Session Check

```typescript
// ❌ OLD
if (session.info.isLoggedIn) {
  const webId = session.info.webId
}

// ✅ NEW
const auth = useAuthStore()
if (auth.isLoggedIn) {
  const webId = auth.webId
}
```

### 4. Logout

```typescript
// ❌ OLD
import { logout } from "@inrupt/solid-client-authn-browser"
await logout()

// ✅ NEW
const auth = useAuthStore()
await auth.logout()
```

## Configuration Changes

### Environment Variables

**Before:**
```env
ODYSSEY_BASE_URL=http://localhost:3000
```

**After:**
```env
BASE_URL=http://localhost:3000
ODYSSEY_BASE_URL=http://localhost:3000  # Still supported for backwards compatibility
```

### Client Registration

**Before:** Dynamic client registration handled by Inrupt library

**After:** Static client registration via `public/clientid.json`

You must update this file for production deployments.

## Migration Checklist

- [x] Remove Inrupt imports from active code
- [x] Replace `getDefaultSession()` with `useAuthStore()`
- [x] Replace `session.fetch()` with `fetchWithAuth()`
- [x] Update environment variables
- [x] Create `clientid.json` file
- [x] Add `/callback` route
- [x] Test login flow
- [x] Test logout flow
- [x] Test token refresh
- [x] Test ActivityPods provider
- [ ] Test with your production domain
- [ ] Update `clientid.json` for production
- [ ] Verify CORS settings on pod provider

## Testing the Migration

### 1. Test Login

1. Start the dev server: `pnpm dev`
2. Open `http://localhost:3000`
3. Click login and enter `https://mypod.store`
4. Complete authentication at ActivityPods
5. Verify redirect to `/callback` then to `/`
6. Check console for "ActivityPods outbox detected"

### 2. Test Session Persistence

1. Login successfully
2. Refresh the page
3. Verify you're still logged in
4. Check sessionStorage for `activitypods_session`

### 3. Test Logout

1. Click logout
2. Verify redirect to pod provider logout
3. Verify session cleared from sessionStorage
4. Verify you're logged out

### 4. Test Token Refresh

1. Login successfully
2. Wait for token to be close to expiry (or modify `expiresAt` in sessionStorage)
3. Trigger a request
4. Verify token is automatically refreshed

## Troubleshooting Migration Issues

### "Cannot find name 'useActivityPodsAuth'"

**Cause:** Import not added to file
**Fix:** Add import: `import { useActivityPodsAuth } from '~/composables/useActivityPodsAuth'`

### "session.fetch is not a function"

**Cause:** Using old Inrupt session API
**Fix:** Replace with `fetchWithAuth(auth.session, url)` from `useActivityPodsAuth()`

### "Failed to fetch OIDC configuration"

**Cause:** Provider URL is incorrect or provider is down
**Fix:** Verify provider URL is accessible and has `/.well-known/openid-configuration`

### "Redirect URI mismatch"

**Cause:** `redirect_uri` in `clientid.json` doesn't match actual redirect
**Fix:** Update `redirect_uris` in `clientid.json` to match your domain

## Support

For issues or questions about the migration:

1. Check `ACTIVITYPODS_AUTH.md` for detailed authentication docs
2. Review console logs for specific error messages
3. Verify `clientid.json` configuration matches your deployment
4. Test with the reference ActivityPods provider: `https://mypod.store`

## Rollback Plan

If you need to rollback to Inrupt:

1. Restore `app/stores/authStore.ts` from git history
2. Restore `app/composables/useSolidAuth.ts` (uncomment code)
3. Remove new OIDC files
4. Reinstall dependencies if removed: `pnpm add @inrupt/solid-client-authn-browser`
5. Update components to use Inrupt APIs

Note: It's recommended to keep the ActivityPods implementation as it provides better compatibility with ActivityPods providers and follows modern OAuth 2.0 best practices.
