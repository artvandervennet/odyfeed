# Easy Deployment Guide

## Quick Deployment (TL;DR)

### For Production

1. **Set ONE environment variable:**
   ```bash
   BASE_URL=https://your-domain.com
   ```

2. **Build and deploy:**
   ```bash
   pnpm build
   ```

That's it! The `clientid.json` is automatically generated from `BASE_URL`.

---

## How It Works

### Automatic Configuration

The application now **automatically detects** your domain and generates `clientid.json` accordingly:

- **Client-side:** Uses `window.location.origin` (the URL in your browser)
- **Server-side:** Uses `BASE_URL` environment variable
- ✅ No manual editing of JSON files
- ✅ Works automatically in any environment
- ✅ Only one environment variable needed

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `BASE_URL` | **For server APIs** | Your application URL (with https:// for production) |
| `OPENAI_API_KEY` | Optional | For AI features |

**Note:** The client-side authentication automatically uses your current domain, so `BASE_URL` is primarily for server-side API responses.

---

## Environment Setup

### Local Development

Create `.env` file:
```bash
BASE_URL=http://localhost:3000
```

Start development:
```bash
pnpm dev
```

### Production

Set environment variable (method depends on your hosting):

#### Vercel / Netlify / Cloud Platforms
Add in dashboard:
```
BASE_URL=https://your-domain.com
```

#### Traditional Server (.env file)
```bash
BASE_URL=https://your-domain.com
```

#### Docker
```bash
docker run -e BASE_URL=https://your-domain.com ...
```

#### Systemd Service
```ini
[Service]
Environment="BASE_URL=https://your-domain.com"
```

---

## Verification

### 1. Check Configuration

Visit your deployed app at:
```
https://your-domain.com/clientid.json
```

Should show:
```json
{
  "@context": "https://www.w3.org/ns/solid/oidc-context.jsonld",
  "client_id": "https://your-domain.com/clientid.json",
  "redirect_uris": ["https://your-domain.com/callback"],
  ...
}
```

### 2. Test Login Flow

1. Visit your app: `https://your-domain.com`
2. Click "Login"
3. Enter provider: `https://mypod.store`
4. Complete authentication
5. Should redirect back to your app successfully

---

## Troubleshooting

### Problem: clientid.json shows localhost URLs in production

**Cause:** BASE_URL environment variable not set correctly

**Fix:**
```bash
# Check your env variable
echo $BASE_URL

# Should output: https://your-domain.com
# If not, set it in your deployment platform
```

### Problem: CORS errors when accessing clientid.json

**Cause:** Server not sending CORS headers

**Fix:** The server route automatically sets CORS headers. If still having issues, check your reverse proxy (nginx, etc.) isn't stripping them.

### Problem: Login redirects to wrong URL

**Cause:** BASE_URL doesn't match your actual domain

**Fix:** 
```bash
# Make sure BASE_URL exactly matches your domain
# Include https:// for production
# No trailing slash
BASE_URL=https://your-domain.com  ✅
BASE_URL=https://your-domain.com/ ❌
```

---

## Migration from Manual Configuration

### Old Way (Before)
```json
// Had to manually edit public/clientid.json
{
  "client_id": "https://your-domain.com/clientid.json",
  "redirect_uris": ["https://your-domain.com/callback"]
}
```

### New Way (Now)
```bash
# Just set env variable - JSON is auto-generated
BASE_URL=https://your-domain.com
```

---

## Technical Details

### How It Works

1. **Client-side:** `useActivityPodsAuth.ts` uses `window.location.origin` to get current domain
2. **Build Hook:** `nuxt.config.ts` Nitro hook generates static `clientid.json` from `BASE_URL` env
3. **Static Serving:** The generated JSON file is served as a normal static file (proper MIME type)
4. **Auto-detection:** Client always uses the correct domain without configuration

### Files Modified

- ✅ `nuxt.config.ts` - Added Nitro hook for build-time generation
- ✅ `app/composables/useActivityPodsAuth.ts` - Uses `window.location.origin`
- ✅ All server API files - Use `BASE_URL` instead of `ODYSSEY_BASE_URL`
- ✅ `.env.example` - Single environment variable

### Generated File

The file `.output/public/clientid.json` is **automatically generated during build** with the correct URLs from your `BASE_URL` environment variable.

---

## See Also

- [ACTIVITYPODS_AUTH.md](./ACTIVITYPODS_AUTH.md) - Full authentication documentation
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Detailed deployment steps
- [README.md](./README.md) - General application documentation
