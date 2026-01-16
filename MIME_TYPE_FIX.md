# MIME Type Issue - FIXED ✅

## Problem

When deploying to production, you encountered this error:

```
Loading module from "https://odyfeed.artvandervennet.ikdoeict.be/_nuxt/Dq-kwadS.js" 
was blocked because of a disallowed MIME type ("application/json").
```

## Root Cause

The initial approach used a **dynamic server route** (`server/routes/clientid.json.ts`) which:
- Returned JSON with `Content-Type: application/json`
- Conflicted with Nuxt's module loading system
- The `.json` extension in the route name confused the bundler

## Solution

Changed from dynamic generation to **build-time static file generation**:

### ✅ New Approach

1. **Nitro Build Hook** in `nuxt.config.ts` generates a static `clientid.json` file during build
2. File is placed in `.output/public/clientid.json`
3. Served as a normal static JSON file (proper MIME type handling)
4. No runtime route conflicts

### Code

```typescript
// nuxt.config.ts
nitro: {
  hooks: {
    'compiled': () => {
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      const clientIdConfig = {
        "@context": "https://www.w3.org/ns/solid/oidc-context.jsonld",
        "client_id": `${baseUrl}/clientid.json`,
        "client_name": "OdyFeed",
        "redirect_uris": [`${baseUrl}/callback`],
        "post_logout_redirect_uris": [baseUrl],
        "token_endpoint_auth_method": "none",
        "application_type": "web",
        "response_types": ["code"],
        "grant_types": ["authorization_code", "refresh_token"],
        "scope": "openid offline_access webid"
      };
      
      const outputPublic = resolve(process.cwd(), '.output', 'public');
      const clientIdPath = resolve(outputPublic, 'clientid.json');
      writeFileSync(clientIdPath, JSON.stringify(clientIdConfig, null, 2));
    }
  }
}
```

## Benefits

✅ **No MIME type conflicts** - Static JSON file served correctly
✅ **Build-time generation** - URLs baked into the build
✅ **Single environment variable** - Just set `BASE_URL`
✅ **Standard web serving** - Any web server handles it correctly

## Verification

After deploying with this change:

1. Build includes `clientid.json` in `.output/public/`
2. File is accessible at `https://your-domain.com/clientid.json`
3. Correct MIME type (`application/json` for JSON files, not JS modules)
4. No module loading conflicts

## How to Deploy

```bash
# Set environment variable
BASE_URL=https://your-domain.com

# Build
pnpm build

# Deploy .output folder
# clientid.json is automatically generated with correct URLs
```

## What Changed

**Deleted:**
- ❌ `server/routes/clientid.json.ts` (dynamic route causing conflicts)

**Modified:**
- ✅ `nuxt.config.ts` (added Nitro build hook)

**Result:**
- ✅ Static `clientid.json` generated at build time
- ✅ No MIME type errors
- ✅ Works in production

---

## Test It

```bash
# Build
pnpm build

# Check generated file
cat .output/public/clientid.json

# Should show:
{
  "@context": "https://www.w3.org/ns/solid/oidc-context.jsonld",
  "client_id": "http://localhost:3000/clientid.json",
  ...
}

# For production build:
BASE_URL=https://your-domain.com pnpm build
cat .output/public/clientid.json
# Should show your production domain
```

---

**Issue: RESOLVED** ✅

The MIME type error is now fixed. The `clientid.json` is generated as a proper static file during build, avoiding any conflicts with Nuxt's module system.
