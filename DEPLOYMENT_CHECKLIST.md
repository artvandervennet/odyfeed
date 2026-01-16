# Production Deployment Checklist

Use this checklist when deploying OdyFeed to production with ActivityPods authentication.

## Pre-Deployment

### 1. Environment Configuration

- [ ] Create production `.env` file
- [ ] Set `BASE_URL` to production domain (e.g., `https://odyfeed.com`)
- [ ] Verify `BASE_URL` has HTTPS (required for OAuth security)
- [ ] Verify `BASE_URL` has no trailing slash
- [ ] Set any other required environment variables (OpenAI API key, etc.)

**Example:**
```env
BASE_URL=https://odyfeed.com
OPENAI_API_KEY=your_production_key
```

### 2. Client ID Configuration

- [ ] Open `public/clientid.json`
- [ ] Update `client_id` to `https://your-domain.com/clientid.json`
- [ ] Update `redirect_uris` to `["https://your-domain.com/callback"]`
- [ ] Update `post_logout_redirect_uris` to `["https://your-domain.com"]`
- [ ] Verify all URLs use HTTPS
- [ ] Verify all URLs match your production domain exactly

**Example:**
```json
{
  "@context": "https://www.w3.org/ns/solid/oidc-context.jsonld",
  "client_id": "https://odyfeed.com/clientid.json",
  "client_name": "OdyFeed",
  "redirect_uris": ["https://odyfeed.com/callback"],
  "post_logout_redirect_uris": ["https://odyfeed.com"],
  "token_endpoint_auth_method": "none",
  "application_type": "web",
  "response_types": ["code"],
  "grant_types": ["authorization_code", "refresh_token"],
  "scope": "openid offline_access webid"
}
```

### 3. Build Application

- [ ] Run `pnpm install` to ensure dependencies are up to date
- [ ] Run `pnpm build` to create production build
- [ ] Verify build completes without errors
- [ ] Check `.output` directory is created

**Commands:**
```bash
pnpm install
pnpm build
```

### 4. Test Build Locally

- [ ] Run `pnpm preview` to test production build locally
- [ ] Test login flow with test provider
- [ ] Test session persistence
- [ ] Test logout flow
- [ ] Check browser console for errors

**Commands:**
```bash
pnpm preview
```

## Deployment

### 5. Deploy Files

- [ ] Upload `.output` directory to server
- [ ] Verify `public/clientid.json` is deployed
- [ ] Ensure `clientid.json` is publicly accessible
- [ ] Test URL: `https://your-domain.com/clientid.json` returns JSON
- [ ] Verify Content-Type is `application/json`

**Test Command:**
```bash
curl https://your-domain.com/clientid.json
```

### 6. Server Configuration

- [ ] Configure server to serve the Nuxt app
- [ ] Enable HTTPS/SSL (required for OAuth)
- [ ] Configure proper CORS headers if needed
- [ ] Set up proper caching for static assets
- [ ] Configure fallback to `index.html` for SPA routing

**Nginx Example:**
```nginx
server {
  listen 443 ssl http2;
  server_name your-domain.com;
  
  ssl_certificate /path/to/cert.pem;
  ssl_certificate_key /path/to/key.pem;
  
  root /var/www/odyfeed/.output/public;
  
  location / {
    try_files $uri $uri/ /index.html;
  }
  
  location ~ /clientid\.json$ {
    add_header Content-Type application/json;
    add_header Access-Control-Allow-Origin *;
  }
}
```

### 7. DNS Configuration

- [ ] Verify DNS points to server
- [ ] Test domain resolves correctly
- [ ] Verify both `www` and non-`www` work (or redirect)
- [ ] Test HTTPS certificate is valid

**Test Command:**
```bash
nslookup your-domain.com
```

## Post-Deployment Testing

### 8. Functional Testing

#### Basic Access
- [ ] Visit `https://your-domain.com`
- [ ] Page loads without errors
- [ ] No console errors
- [ ] UI renders correctly

#### Client ID Document
- [ ] Visit `https://your-domain.com/clientid.json`
- [ ] JSON document loads
- [ ] Content-Type is `application/json`
- [ ] All URLs in document are correct

#### Login Flow
- [ ] Click login button
- [ ] Enter `https://mypod.store` as provider
- [ ] Redirects to ActivityPods login
- [ ] Complete authentication
- [ ] Redirects to `https://your-domain.com/callback`
- [ ] Redirects to `https://your-domain.com` (home)
- [ ] User is logged in
- [ ] WebID is displayed
- [ ] No errors in console

#### Session Persistence
- [ ] After logging in, refresh page
- [ ] Still logged in after refresh
- [ ] Session data persists

#### Logout Flow
- [ ] Click logout button
- [ ] Redirects to provider logout
- [ ] Redirects back to app
- [ ] User is logged out
- [ ] Session cleared

### 9. Security Testing

- [ ] HTTPS is enforced (HTTP redirects to HTTPS)
- [ ] SSL certificate is valid
- [ ] No mixed content warnings
- [ ] Tokens not exposed in URLs
- [ ] Session storage used (not localStorage)
- [ ] CORS configured correctly

**Tools:**
- [SSL Labs](https://www.ssllabs.com/ssltest/)
- Browser DevTools > Security tab

### 10. Performance Testing

- [ ] Page loads in < 3 seconds
- [ ] No unnecessary network requests
- [ ] Assets are cached properly
- [ ] Images optimized
- [ ] Bundle size reasonable

**Tools:**
- [PageSpeed Insights](https://pagespeed.web.dev/)
- Browser DevTools > Network tab

## Provider Testing

### 11. Test with ActivityPods

- [ ] Login with `https://mypod.store` works
- [ ] Inbox detected
- [ ] Outbox detected
- [ ] Can fetch profile
- [ ] Can make authenticated requests

### 12. Test with Generic Solid

- [ ] Login with `https://login.inrupt.com` works
- [ ] Warning about missing ActivityStreams shown
- [ ] Basic functionality still works

### 13. Test with Custom Provider

- [ ] Can enter custom provider URL
- [ ] Provider validation works
- [ ] Error shown for invalid provider
- [ ] Success for valid provider

## Monitoring & Maintenance

### 14. Error Monitoring

- [ ] Set up error tracking (Sentry, etc.)
- [ ] Monitor console errors
- [ ] Track failed logins
- [ ] Monitor API errors

### 15. Analytics (Optional)

- [ ] Set up analytics if desired
- [ ] Track login success rate
- [ ] Track provider usage
- [ ] Monitor session duration

### 16. Backup & Recovery

- [ ] Document deployment process
- [ ] Keep backup of working build
- [ ] Document rollback procedure
- [ ] Test recovery process

## Common Issues & Solutions

### Issue: "Redirect URI mismatch"
**Solution:** Verify `redirect_uris` in `clientid.json` exactly matches callback URL

### Issue: "clientid.json not found"
**Solution:** Verify file is in `public/` directory and is deployed

### Issue: "Invalid client"
**Solution:** Verify `client_id` URL is publicly accessible

### Issue: "CORS error"
**Solution:** Add CORS headers to `clientid.json` endpoint

### Issue: "SSL certificate error"
**Solution:** Verify SSL certificate is valid and not expired

### Issue: "Session not persisting"
**Solution:** Check browser allows sessionStorage; verify no errors in console

## Optional: Remove Inrupt Dependencies

If you want to clean up unused dependencies:

```bash
pnpm remove @inrupt/solid-client-authn-browser @inrupt/solid-client
```

- [ ] Remove packages
- [ ] Run `pnpm install`
- [ ] Test app still works
- [ ] Rebuild and redeploy

## Post-Deployment

### Documentation
- [ ] Update team documentation
- [ ] Document production URLs
- [ ] Share troubleshooting guide
- [ ] Document monitoring setup

### Communication
- [ ] Notify users of deployment
- [ ] Share provider setup instructions
- [ ] Provide support contact
- [ ] Collect feedback

## Sign-Off

- [ ] All checklist items completed
- [ ] App tested and working
- [ ] Team notified
- [ ] Documentation updated

**Deployed By:** _______________
**Date:** _______________
**Production URL:** _______________
**Notes:** _______________

---

## Quick Commands Reference

```bash
# Install dependencies
pnpm install

# Build for production
pnpm build

# Preview production build
pnpm preview

# Deploy (example with rsync)
rsync -avz .output/ user@server:/var/www/odyfeed/

# Test clientid.json
curl https://your-domain.com/clientid.json

# Check SSL
curl -I https://your-domain.com

# View logs (if using PM2)
pm2 logs odyfeed
```

## Support Resources

- Documentation: `ACTIVITYPODS_AUTH.md`
- Quick Reference: `QUICK_REFERENCE.md`
- Migration Guide: `MIGRATION.md`
- Summary: `REFACTORING_SUMMARY.md`

---

**Version:** 1.0
**Last Updated:** January 2026
