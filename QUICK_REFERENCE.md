# ActivityPods Auth - Quick Reference

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Set environment
echo "BASE_URL=http://localhost:3000" > .env

# 3. Run dev server
pnpm dev

# 4. Login at http://localhost:3000
# Use provider: https://mypod.store
```

## Common Code Patterns

### Check if Logged In
```typescript
const auth = useAuthStore()

if (auth.isLoggedIn) {
  console.log('WebID:', auth.webId)
  console.log('Outbox:', auth.outbox)
  console.log('Inbox:', auth.inbox)
}
```

### Login
```typescript
const auth = useAuthStore()
await auth.login('https://mypod.store')
```

### Logout
```typescript
const auth = useAuthStore()
await auth.logout()
```

### Authenticated Fetch
```typescript
const auth = useAuthStore()
const { fetchWithAuth } = useActivityPodsAuth()

if (auth.session) {
  const response = await fetchWithAuth(
    auth.session,
    'https://example.com/resource',
    { method: 'GET' }
  )
  const data = await response.json()
}
```

### Access Session Data
```typescript
const auth = useAuthStore()

if (auth.session) {
  const webId = auth.session.webId
  const idToken = auth.session.idToken
  const expiresAt = auth.session.expiresAt
  const issuer = auth.session.issuer
}
```

## File Locations

| What | Where |
|------|-------|
| Auth Logic | `app/composables/useActivityPodsAuth.ts` |
| Auth State | `app/stores/authStore.ts` |
| Login UI | `app/components/LoginModal.vue` |
| OAuth Callback | `app/pages/callback.vue` |
| Client Config | `public/clientid.json` |
| OIDC Types | `app/types/oidc.ts` |
| OIDC Utils | `app/utils/oidc.ts` |

## Configuration

### Local Development
```json
// public/clientid.json
{
  "client_id": "http://localhost:3000/clientid.json",
  "redirect_uris": ["http://localhost:3000/callback"]
}
```

### Production
```json
// public/clientid.json
{
  "client_id": "https://your-domain.com/clientid.json",
  "redirect_uris": ["https://your-domain.com/callback"]
}
```

```env
# .env
BASE_URL=https://your-domain.com
```

## Supported Providers

### ActivityPods ✅
- URL: `https://mypod.store`
- Features: Full ActivityStreams, inbox/outbox
- Status: Fully supported

### Generic Solid ⚠️
- URL: Various (e.g., `https://login.inrupt.com`)
- Features: Basic Solid storage only
- Status: Limited support

### Custom 🔧
- Any OIDC-compliant provider
- App validates before redirect
- Must have `/.well-known/openid-configuration`

## Troubleshooting

### Login Fails
```typescript
// Check provider is reachable
const { discoverOIDCConfiguration } = await import('~/utils/oidc')
await discoverOIDCConfiguration('https://mypod.store')
```

### No Session After Login
1. Check console for errors
2. Verify redirect URI matches `clientid.json`
3. Check sessionStorage for `activitypods_session`

### Token Expired
```typescript
// Manually trigger refresh
const { refreshSession } = useActivityPodsAuth()
if (auth.session) {
  const newSession = await refreshSession(auth.session)
}
```

### Clear Session
```typescript
// Force logout and clear storage
const { clearSession } = useActivityPodsAuth()
clearSession()
```

## Development Tips

### Test Different Providers
```typescript
// In LoginModal or console
await auth.login('https://mypod.store')          // ActivityPods
await auth.login('https://login.inrupt.com')     // Inrupt
await auth.login('https://your-custom-pod.com')  // Custom
```

### Mock Session for Testing
```typescript
// In browser console (dev only!)
sessionStorage.setItem('activitypods_session', JSON.stringify({
  webId: 'https://test.pod/profile#me',
  idToken: 'fake-token',
  accessToken: 'fake-access',
  expiresAt: Date.now() + 3600000,
  issuer: 'https://test.pod'
}))
```

### Check Session Expiry
```typescript
const auth = useAuthStore()
if (auth.session) {
  const now = Date.now()
  const expiresIn = auth.session.expiresAt - now
  console.log(`Token expires in ${Math.round(expiresIn / 1000)}s`)
}
```

## API Reference

### useAuthStore()
```typescript
interface AuthStore {
  // State
  isLoggedIn: boolean
  webId: string
  session: AuthSession | null
  outbox?: string
  inbox?: string
  
  // Actions
  login(provider: string): Promise<void>
  logout(): Promise<void>
  initSession(): Promise<void>
  validatePodCapabilities(): Promise<void>
}
```

### useActivityPodsAuth()
```typescript
interface ActivityPodsAuth {
  startLoginFlow(issuer: string): Promise<void>
  handleCallback(): Promise<AuthSession | null>
  refreshSession(session: AuthSession): Promise<AuthSession | null>
  logout(session: AuthSession): Promise<void>
  getStoredSession(): AuthSession | null
  clearSession(): void
  fetchWithAuth(session: AuthSession, url: string, options?: RequestInit): Promise<Response>
}
```

## Security Notes

✅ Sessions stored in sessionStorage (cleared on tab close)
✅ PKCE prevents code interception
✅ State parameter prevents CSRF
✅ Tokens sent via Authorization header
✅ Auto-refresh reduces long-lived token exposure

❌ Don't store tokens in localStorage
❌ Don't expose tokens in URLs
❌ Don't disable HTTPS in production

## Documentation

- 📖 Full Guide: `ACTIVITYPODS_AUTH.md`
- 🔄 Migration: `MIGRATION.md`
- 📋 Summary: `REFACTORING_SUMMARY.md`
- 📚 README: `README.md`

## Need Help?

1. Check browser console for errors
2. Review documentation files above
3. Test with `https://mypod.store` first
4. Verify `clientid.json` configuration
5. Check network tab for failed requests

---

**Last Updated:** January 2026
**Version:** ActivityPods v2 Compatible
