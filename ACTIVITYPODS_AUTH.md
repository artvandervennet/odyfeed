# ActivityPods Authentication Guide

This application has been refactored to work with ActivityPods pod providers using native OIDC (Authorization Code + PKCE flow) instead of Inrupt's Solid client libraries.

## Overview

The authentication system implements:
- **Authorization Code flow with PKCE (S256)** - More secure than implicit flow
- **Token refresh** - Automatic token renewal using refresh tokens
- **Session persistence** - Sessions survive page reloads
- **Provider discovery** - Automatic OIDC configuration discovery
- **ActivityStreams support** - Detects ActivityPods-specific inbox/outbox

## Architecture

### Key Files

1. **`/public/clientid.json`** - Static OIDC client registration document
2. **`/app/types/oidc.ts`** - TypeScript types for OIDC flow
3. **`/app/utils/oidc.ts`** - PKCE generation and JWT parsing utilities
4. **`/app/composables/useActivityPodsAuth.ts`** - Main authentication composable
5. **`/app/stores/authStore.ts`** - Pinia store for auth state management
6. **`/app/pages/callback.vue`** - OAuth callback handler page

### Authentication Flow

```
1. User enters pod provider URL (e.g., https://mypod.store)
2. App discovers OIDC configuration (/.well-known/openid-configuration)
3. App generates PKCE challenge and redirects to authorization endpoint
4. User authenticates at their pod provider
5. Provider redirects back to /callback with authorization code
6. App exchanges code for ID token + refresh token
7. App stores session and validates pod capabilities (inbox/outbox)
8. User is authenticated and can access protected resources
```

## Configuration

### 1. Update `clientid.json` for Production

Edit `/public/clientid.json` and update URLs for your production domain:

```json
{
  "@context": "https://www.w3.org/ns/solid/oidc-context.jsonld",
  "client_id": "https://your-domain.com/clientid.json",
  "client_name": "OdyFeed",
  "redirect_uris": ["https://your-domain.com/callback"],
  "post_logout_redirect_uris": ["https://your-domain.com"],
  "token_endpoint_auth_method": "none",
  "application_type": "web",
  "response_types": ["code"],
  "grant_types": ["authorization_code", "refresh_token"],
  "scope": "openid offline_access webid"
}
```

### 2. Set Environment Variable

Create `.env` file:

```bash
BASE_URL=http://localhost:3000  # Change for production
```

The `BASE_URL` is used to construct redirect URIs and must match what's in `clientid.json`.

### 3. Deploy `clientid.json`

The `clientid.json` file must be publicly accessible at:
- `https://your-domain.com/clientid.json`

This file serves as your OAuth client registration document.

## Supported Providers

### ActivityPods (Recommended)
- URL: `https://mypod.store`
- Features: Full ActivityStreams support, inbox/outbox detection
- Status: ✅ Fully supported

### Generic Solid Pods
- URL: Various (e.g., `https://login.inrupt.com`)
- Features: Basic Solid storage
- Status: ⚠️ Partially supported (no ActivityStreams features)

### Custom Providers
Users can enter any OIDC-compliant provider URL. The app will:
1. Attempt to discover OIDC configuration
2. Validate the provider before redirecting
3. Show error if provider is unreachable or incompatible

## Usage in Components

### Get Current Session

```typescript
import { useAuthStore } from '~/stores/authStore'

const auth = useAuthStore()

// Check if logged in
if (auth.isLoggedIn) {
  console.log('User WebID:', auth.webId)
  console.log('Outbox:', auth.outbox)
  console.log('Inbox:', auth.inbox)
}
```

### Make Authenticated Requests

```typescript
import { useActivityPodsAuth } from '~/composables/useActivityPodsAuth'

const { fetchWithAuth } = useActivityPodsAuth()
const auth = useAuthStore()

if (auth.session) {
  const response = await fetchWithAuth(
    auth.session, 
    'https://mypod.store/resource',
    {
      method: 'GET'
    }
  )
  const data = await response.json()
}
```

### Login/Logout

```typescript
const auth = useAuthStore()

// Login
await auth.login('https://mypod.store')

// Logout
await auth.logout()
```

## Session Management

### Storage
- Sessions are stored in `sessionStorage` (not `localStorage`)
- Sessions clear when browser tab is closed
- Secure: ID tokens are not exposed in URLs

### Token Refresh
- Automatic refresh when token expires within 60 seconds
- Uses refresh token grant type
- Falls back to stored session if refresh fails

### Session Initialization

The app automatically:
1. Checks for OAuth callback (`?code=...` in URL)
2. Restores previous session from sessionStorage
3. Refreshes tokens if needed
4. Validates pod capabilities (ActivityStreams support)

## Known Limitations

### ActivityPods v2 Constraints

1. **No DPoP (yet)** - Uses bearer ID token instead of DPoP-bound tokens
2. **Avoid `prompt=consent`** - Known issue with consent prompt in current version
3. **Token endpoint auth** - Must use `none` (no client secret)

### Workarounds Applied

- Using `prompt=login` instead of `prompt=consent`
- ID token as bearer token (not access token with DPoP)
- Scopes: `openid offline_access webid`

## Troubleshooting

### Login fails with "Unable to connect"
- Check provider URL is correct and accessible
- Verify `/.well-known/openid-configuration` endpoint exists
- Check browser console for CORS errors

### Callback shows blank page
- Verify `redirect_uri` in `clientid.json` matches your domain
- Check `/callback` route exists and is accessible
- Look for errors in browser console

### Token refresh fails
- Check if provider supports `refresh_token` grant type
- Verify `offline_access` scope is requested
- Provider may require re-authentication

### No inbox/outbox detected
- This is expected for generic Solid pods
- Only ActivityPods providers expose ActivityStreams endpoints
- App will show warning but continue to work

## Future Enhancements

When ActivityPods implements these features:

1. **DPoP Support** - Switch from bearer tokens to DPoP-bound access tokens
2. **Consent Prompt** - Re-enable `prompt=consent` for better UX
3. **SAI/App Installation** - Implement Solid Application Interoperability
4. **ShapeTrees** - Structured data storage with access needs

## Security Notes

- ✅ PKCE prevents authorization code interception
- ✅ State parameter prevents CSRF attacks
- ✅ Tokens stored in sessionStorage (not localStorage)
- ✅ Automatic token refresh reduces long-lived token exposure
- ✅ Bearer token sent via Authorization header (not URL)
- ⚠️ SSR disabled (`ssr: false`) - required for browser-only OIDC flow

## References

- [ActivityPods Documentation](https://activitypods.org/)
- [Solid-OIDC Spec](https://solidproject.org/TR/oidc)
- [OAuth 2.0 PKCE](https://oauth.net/2/pkce/)
- [OpenID Connect](https://openid.net/connect/)
