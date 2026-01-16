# ✅ Verification Checklist

Quick checklist to verify the ActivityPods authentication implementation is working correctly.

## Pre-Flight Check

- [ ] Dependencies installed (`pnpm install` completed successfully)
- [ ] No TypeScript errors in key files
- [ ] `.env` file exists with `BASE_URL` set
- [ ] `public/clientid.json` exists and has correct URLs

## Files Exist

### Core Implementation
- [ ] `app/types/oidc.ts`
- [ ] `app/utils/oidc.ts`
- [ ] `app/composables/useActivityPodsAuth.ts`
- [ ] `app/pages/callback.vue`
- [ ] `public/clientid.json`

### Updated Files
- [ ] `app/stores/authStore.ts` (updated)
- [ ] `app/components/LoginModal.vue` (updated)
- [ ] `nuxt.config.ts` (updated)

### Documentation
- [ ] `ACTIVITYPODS_AUTH.md`
- [ ] `MIGRATION.md`
- [ ] `REFACTORING_SUMMARY.md`
- [ ] `QUICK_REFERENCE.md`
- [ ] `DEPLOYMENT_CHECKLIST.md`
- [ ] `DOCUMENTATION_INDEX.md`

## Development Server

- [ ] Run `pnpm dev` without errors
- [ ] Server starts on http://localhost:3000
- [ ] Homepage loads successfully
- [ ] No console errors on page load
- [ ] Login modal appears when clicking login

## Login Flow (Development)

### Provider Selection
- [ ] Can open login modal
- [ ] ActivityPods provider shown (`https://mypod.store`)
- [ ] Can select provider
- [ ] Can toggle to custom provider
- [ ] Can enter custom provider URL

### Provider Validation
- [ ] Validation runs before redirect
- [ ] Shows loading state during validation
- [ ] Shows error for invalid provider
- [ ] Allows valid provider to proceed

### OAuth Flow
- [ ] Clicking Continue redirects to provider
- [ ] URL includes `code_challenge` parameter
- [ ] URL includes `state` parameter
- [ ] URL includes correct `redirect_uri`
- [ ] URL includes correct `client_id`

### After Authentication
- [ ] Redirects to `/callback` page
- [ ] Shows loading state
- [ ] Exchanges code for tokens
- [ ] Redirects to homepage
- [ ] User is logged in
- [ ] WebID is displayed
- [ ] No console errors

### Session Data
- [ ] `sessionStorage` contains `activitypods_session`
- [ ] Session includes `webId`
- [ ] Session includes `idToken`
- [ ] Session includes `expiresAt`

### ActivityPods Features (if using ActivityPods provider)
- [ ] Console shows "ActivityPods outbox detected"
- [ ] Console shows "ActivityPods inbox detected"
- [ ] Outbox URL is displayed or accessible
- [ ] Inbox URL is displayed or accessible

## Session Persistence

- [ ] Refresh page while logged in
- [ ] Still logged in after refresh
- [ ] WebID still displayed
- [ ] Session data persists in sessionStorage
- [ ] No new login required

## Token Refresh (Optional - requires waiting or manipulation)

- [ ] Wait for token to near expiry (or modify expiresAt in sessionStorage)
- [ ] Make a request or trigger app interaction
- [ ] Token refreshes automatically
- [ ] New token stored in sessionStorage
- [ ] No logout or errors occur

## Logout Flow

- [ ] Click logout button
- [ ] Redirects to provider logout endpoint
- [ ] Shows logout page at provider (if supported)
- [ ] Redirects back to app
- [ ] User is logged out
- [ ] Session cleared from sessionStorage
- [ ] Login modal available again

## Error Handling

### Invalid Provider
- [ ] Enter invalid provider URL (e.g., `https://invalid-provider.com`)
- [ ] Error message displayed
- [ ] User stays on login modal
- [ ] Can try again with valid provider

### Network Errors
- [ ] Test with network disabled (optional)
- [ ] Error message displayed
- [ ] App doesn't crash
- [ ] Can retry when network restored

## Code Quality

### TypeScript
- [ ] No compilation errors
- [ ] Types properly defined
- [ ] No `any` types used
- [ ] Imports resolve correctly

### Console
- [ ] No errors in browser console
- [ ] Only expected warnings (if any)
- [ ] Logs are helpful for debugging
- [ ] No sensitive data logged

## Documentation

- [ ] README.md updated with ActivityPods info
- [ ] All documentation files exist
- [ ] Documentation is clear and complete
- [ ] Code examples work
- [ ] Links in documentation are correct

## Configuration

### Development
- [ ] `clientid.json` has `http://localhost:3000` URLs
- [ ] `.env` has `BASE_URL=http://localhost:3000`
- [ ] URLs match exactly (no trailing slashes where not needed)

### Ready for Production
- [ ] Know how to update `clientid.json` for production
- [ ] Know how to update `.env` for production
- [ ] Have deployment checklist ready
- [ ] Understand HTTPS requirement

## Compatibility

### Providers Tested
- [ ] ActivityPods (`https://mypod.store`) works
- [ ] Generic Solid pod works (if available)
- [ ] Custom provider validation works
- [ ] Error handling works for invalid providers

### Browsers Tested
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if available)
- [ ] Mobile browser (if applicable)

## Performance

- [ ] Page loads quickly
- [ ] Login flow is responsive
- [ ] No noticeable delays
- [ ] Callback processes quickly
- [ ] Session restore is fast

## Security

- [ ] Tokens not visible in URLs
- [ ] State parameter used (check URL during auth)
- [ ] PKCE challenge used (check URL during auth)
- [ ] Session in sessionStorage (not localStorage)
- [ ] HTTPS enforced (or will be in production)

## Final Checks

- [ ] All tests above passed
- [ ] Documentation read and understood
- [ ] Ready to proceed with development
- [ ] Know where to find help if needed
- [ ] Confident in the implementation

## Score

**Total Checks:** 100+
**Passed:** ___ / 100+
**Status:** ⬜ Not Started | 🟡 In Progress | ✅ Complete

## Next Steps

### If All Green ✅
→ Start developing features!
→ Read [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for patterns
→ Prepare for production with [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

### If Issues Found 🔴
→ Check [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) troubleshooting
→ Review [ACTIVITYPODS_AUTH.md](./ACTIVITYPODS_AUTH.md)
→ Verify configuration files
→ Check browser console for errors

### If Questions 💭
→ Check [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)
→ Find relevant documentation
→ Review code examples
→ Test with reference provider: `https://mypod.store`

---

**Checklist Version:** 1.0
**Last Updated:** January 2026
**Compatible With:** ActivityPods v2, Nuxt 4

---

## Quick Test Script

Run this in browser console after login:

```javascript
// Check session
const session = JSON.parse(sessionStorage.getItem('activitypods_session'))
console.log('Session:', session)
console.log('WebID:', session?.webId)
console.log('Expires:', new Date(session?.expiresAt))

// Check auth store
const auth = useAuthStore()
console.log('Logged in:', auth.isLoggedIn)
console.log('Outbox:', auth.outbox)
console.log('Inbox:', auth.inbox)
```

If this shows valid data, authentication is working! ✅
