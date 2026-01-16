# Configuration Simplification Summary

## Changes Made

### ✅ Problem Solved

**Before:**
- Used `useRuntimeConfig()` which doesn't work reliably in client-side composables
- Had two environment variables: `BASE_URL` and `ODYSSEY_BASE_URL`
- Required manual editing of `clientid.json` for production

**After:**
- Uses `window.location.origin` on client-side (always correct, no config needed)
- Single environment variable: `BASE_URL` (only for server-side APIs)
- Automatic `clientid.json` generation from server route

---

## How It Works Now

### Client-Side (Authentication)

Location: `app/composables/useActivityPodsAuth.ts`

```typescript
const baseUrl = typeof window !== 'undefined' 
  ? window.location.origin 
  : 'http://localhost:3000';
```

- **Always uses the current domain** from the browser
- No configuration needed
- Works automatically in dev, staging, and production

### Server-Side (API Responses)

Location: All server API files

```typescript
const baseUrl = process.env.BASE_URL || "http://localhost:3000";
```

- Reads from `BASE_URL` environment variable
- Used for generating ActivityPub actor URLs and collections

### Build-time clientid.json Generation

Location: `nuxt.config.ts` (Nitro compiled hook)

```typescript
nitro: {
  hooks: {
    'compiled': () => {
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      // Generate clientid.json in .output/public/
      writeFileSync(outputPath, JSON.stringify(config, null, 2));
    }
  }
}
```

- Generates static `clientid.json` file during build
- Reads from `BASE_URL` environment variable
- Creates proper JSON file (no MIME type issues)
- Automatically included in deployment

---

## Files Changed

### Modified Files

1. **`app/composables/useActivityPodsAuth.ts`**
   - Changed from `useRuntimeConfig()` to `window.location.origin`
   - Simpler and more reliable

2. **`nuxt.config.ts`** (added Nitro hook)
   - Build-time generation of `clientid.json`
   - Uses `process.env.BASE_URL` to create static JSON file

3. **Server API Files** (updated all)
   - `server/utils/rdf.ts`
   - `server/api/actors/[username]/inbox.get.ts`
   - `server/api/actors/[username]/outbox.get.ts`
   - `server/api/actors/[username]/following.get.ts`
   - `server/api/actors/[username]/followers.get.ts`
   - `server/routes/seed.get.ts`
   - Changed from `ODYSSEY_BASE_URL` to `BASE_URL`

4. **Environment Files**
   - `.env` - Removed `ODYSSEY_BASE_URL`
   - `.env.example` - Removed `ODYSSEY_BASE_URL`, updated docs

### Documentation Updated

1. **`EASY_DEPLOY.md`** (new)
   - Simple deployment guide
   - Focus on the one environment variable needed

2. **`README.md`**
   - Removed manual clientid.json editing instructions
   - References new EASY_DEPLOY.md

3. **`CONFIGURATION_SIMPLIFIED.md`** (this file)
   - Technical summary of changes

---

## Migration Guide

### If You're Currently Deployed

**Old `.env`:**
```bash
ODYSSEY_BASE_URL=https://your-domain.com
BASE_URL=https://your-domain.com
```

**New `.env`:**
```bash
BASE_URL=https://your-domain.com
```

Just remove `ODYSSEY_BASE_URL` - that's it!

### Testing

1. **Test Local:**
   ```bash
   pnpm dev
   ```
   Visit: http://localhost:3000
   Check: http://localhost:3000/clientid.json

2. **Test Production:**
   Deploy with `BASE_URL=https://your-domain.com`
   Check: https://your-domain.com/clientid.json

Both should show the correct URLs automatically.

---

## Why This Approach is Better

### Advantages

1. **Client-side:** Always correct without configuration
   - Uses the actual URL in the browser
   - No environment variable needed
   - Works in any deployment scenario

2. **Server-side:** One environment variable
   - Simpler configuration
   - Less confusion
   - Easier to deploy

3. **Dynamic Generation:** No manual editing
   - `clientid.json` adapts to environment
   - No chance of forgetting to update it
   - CORS headers automatically included

### Why Not Runtime Config?

The `useRuntimeConfig()` approach has issues:
- Doesn't work reliably in client-side composables
- Requires SSR or special handling
- More complex than needed

The `window.location.origin` approach:
- Always available in browser
- Always correct
- No configuration needed
- Simple and reliable

---

## Verification Checklist

After deploying, verify:

- [ ] Visit your app - loads correctly
- [ ] Visit `/clientid.json` - shows correct URLs
- [ ] Login flow works
- [ ] No CORS errors in console
- [ ] Server API responses use correct domain

---

## Troubleshooting

### Issue: clientid.json shows wrong URLs

**Check:**
```bash
# What's your BASE_URL?
echo $BASE_URL

# Should be your production domain
BASE_URL=https://your-domain.com
```

### Issue: Login redirects to wrong URL

**Cause:** Browser is accessing app through different domain than expected

**Solution:** The app now automatically uses `window.location.origin`, so this shouldn't happen. If it does, check your reverse proxy configuration.

### Issue: Server API responses have wrong URLs

**Cause:** `BASE_URL` environment variable not set

**Solution:**
```bash
BASE_URL=https://your-domain.com
```

---

## Related Documentation

- [EASY_DEPLOY.md](./EASY_DEPLOY.md) - Quick deployment guide
- [ACTIVITYPODS_AUTH.md](./ACTIVITYPODS_AUTH.md) - Full authentication documentation
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Detailed deployment steps
