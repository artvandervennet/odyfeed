# Fix for ActivityPods Backend Error

## Error Details

```
TypeError [ERR_INVALID_ARG_TYPE]: The "url" argument must be of type string. Received undefined
    at Url.parse (node:url:177:3)
    at Module.urlParse (node:url:148:13)
    at interactions (file:///app/backend/node_modules/oidc-provider/lib/actions/authorization/interactions.js:132:17)
```

## Root Cause

The app.json file was mixing **two separate specifications**:
1. OIDC Client Registration (Solid-OIDC spec)
2. Interoperability Application Registration (Solid Interoperability spec)

When ActivityPods tried to parse the `interop:applicationRegistration` URL referenced in clientid.json, it expected a pure interop application document but found OIDC client fields mixed in, causing a parsing error.

## The Fix

### Changed: app.json.ts

**Removed these OIDC client fields** (they belong in clientid.json only):
- `client_id`
- `client_name`
- `redirect_uris`
- `post_logout_redirect_uris`
- `token_endpoint_auth_method`
- `application_type`
- `response_types`
- `grant_types`
- `scope`

**Changed Content-Type header** from `application/json` to `application/ld+json`

**Kept only interop fields:**
- `@context` with interop, acl, foaf namespaces
- `@id`, `@type`
- `interop:applicationName`
- `interop:applicationDescription`
- `interop:applicationAuthor`
- `interop:applicationDeveloperAccount`
- `interop:applicationThumbnail`
- `interop:hasAccessNeedGroup` with permissions

### Document Separation

**clientid.json** (OIDC Client Registration):
- Contains OIDC client fields (redirect_uris, grant_types, etc.)
- References app.json via `interop:applicationRegistration`
- Content-Type: `application/json`

**app.json** (Interop Application Registration):
- Contains only interop application metadata
- Describes permissions needed (inbox, outbox, profile)
- Content-Type: `application/ld+json`

## Why This Matters

According to the Solid-OIDC and Interoperability specs:

1. **OIDC Client Document** (`/clientid.json`)
   - Describes OAuth2/OIDC client configuration
   - Tells the OIDC provider where to redirect, what grants to use, etc.
   - References the application registration document

2. **Application Registration Document** (`/app.json`)
   - Describes the application itself (name, author, purpose)
   - Declares what permissions/access the app needs
   - Used by the pod provider to show user what they're authorizing

These must be separate documents because:
- They serve different purposes in the authorization flow
- They're consumed by different parts of the system
- They follow different JSON-LD schemas

## Testing the Fix

### 1. Verify Endpoints Return Correct Format

**Check app.json:**
```bash
curl https://odyfeed.artvandervennet.ikdoeict.be/app.json
```

Should return:
- Content-Type: `application/ld+json`
- Only interop fields (no client_id, redirect_uris, etc.)
- Valid JSON-LD with proper context

**Check clientid.json:**
```bash
curl https://odyfeed.artvandervennet.ikdoeict.be/clientid.json
```

Should return:
- Content-Type: `application/json`
- OIDC client fields (redirect_uris, grant_types, etc.)
- Reference to app.json in `interop:applicationRegistration`

### 2. Try Login Again

1. Clear browser storage
2. Navigate to your app
3. Click Login
4. Select ActivityPods provider
5. Continue

### 3. Expected Behavior

You should now see:
- ✅ ActivityPods successfully fetches and parses app.json
- ✅ Permission consent screen appears
- ✅ Screen shows: "OdyFeed requests access to:"
  - Read your Inbox
  - Read and Write your Outbox
  - Read your Profile
- ✅ After accepting, app appears in "Registered Apps"

### 4. Check Backend Logs

The ActivityPods backend should no longer show:
- ❌ `Unknown interaction`
- ❌ `TypeError [ERR_INVALID_ARG_TYPE]`

Instead, you should see:
- ✅ Successful consent prompt processing
- ✅ Application registered
- ✅ Authorization code issued

## What Was Wrong in the Original Implementation

```typescript
// ❌ WRONG - app.json had both types of fields mixed
return {
  "@context": [...],
  "@type": "interop:Application",
  "interop:applicationName": "OdyFeed",
  // ... interop fields ...
  "client_id": `${baseUrl}/clientid.json`,  // ❌ OIDC field
  "redirect_uris": [...],                    // ❌ OIDC field
  "grant_types": [...],                      // ❌ OIDC field
  // etc.
}
```

## Correct Implementation

**app.json** (Interop only):
```typescript
return {
  "@context": [...],
  "@type": "interop:Application",
  "interop:applicationName": "OdyFeed",
  "interop:applicationDescription": "...",
  "interop:hasAccessNeedGroup": { ... }
  // Only interop fields
}
```

**clientid.json** (OIDC only + reference):
```typescript
return {
  "@context": [...],
  "client_id": `${baseUrl}/clientid.json`,
  "client_name": "OdyFeed",
  "interop:applicationRegistration": `${baseUrl}/app.json`, // Reference
  "redirect_uris": [...],
  "grant_types": [...],
  // etc.
}
```

## References

- [Solid-OIDC Specification](https://solid.github.io/solid-oidc/)
- [Solid Application Interoperability](https://solid.github.io/data-interoperability-panel/specification/)
- [ActivityPods App Framework](https://docs.activitypods.org/app-framework/)

## Summary

The fix separates OIDC client configuration from interop application registration into two distinct documents, as required by the specifications. This allows ActivityPods to correctly parse the application registration document and display the permission consent screen to users.

---

**Status:** ✅ Fixed - Ready to test

**Action Required:** Restart your development server and try logging in again.
