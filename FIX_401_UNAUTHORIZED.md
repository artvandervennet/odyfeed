# 401 Unauthorized Error Fix

## Issue
You were getting a 401 "Unauthorized" error with "INVALID_TOKEN" when posting to the outbox:
```
{"name":"UnAuthorizedError","message":"Unauthorized","code":401,"type":"INVALID_TOKEN"}
```

## Root Cause
The access token was expired or invalid when the mutation was executed.

## Fix Applied

### 1. ✅ Added Token Validation Function
Created `ensureValidToken()` function in both `like.ts` and `reply.ts` that:
- Checks if session exists
- Calculates time until token expires
- **Auto-refreshes token if expiring in less than 60 seconds**
- Throws clear error if refresh fails

### 2. ✅ Token Refresh Before Mutations
All mutations now call `ensureValidToken(auth)` before executing, which:
- Prevents sending requests with expired tokens
- Automatically refreshes tokens when needed
- Provides better error messages

### 3. ✅ Added Logging
Token check logs show:
```
[Token Check] Token expires in: 1234 seconds
[Token Check] Token expiring soon, refreshing...
[Token Check] Token refreshed successfully
```

## How It Works

### Before (❌ Could fail with 401)
```typescript
mutation: async (post) => {
  // Directly use potentially expired token
  await sendLikeActivity(auth.session, ...)
}
```

### After (✅ Always uses fresh token)
```typescript
mutation: async (post) => {
  // Check and refresh token if needed
  await ensureValidToken(auth)
  
  // Now use fresh token
  await sendLikeActivity(auth.session, ...)
}
```

## Testing the Fix

### 1. Check Token Expiry
Open browser console and check when your token expires:
```javascript
const auth = window.$nuxt.$pinia._s.get('auth')
const expiresAt = new Date(auth.session.expiresAt)
console.log('Token expires at:', expiresAt.toLocaleString())
console.log('Time remaining:', Math.floor((auth.session.expiresAt - Date.now()) / 1000), 'seconds')
```

### 2. Test Near Expiry
If your token is expiring soon (< 60 seconds):
1. Click like button
2. Watch console for: `[Token Check] Token expiring soon, refreshing...`
3. Should see: `[Token Check] Token refreshed successfully`
4. Like should work without 401 error

### 3. Test with Fresh Token
If you just logged in:
1. Click like button
2. Should see: `[Token Check] Token expires in: {large number} seconds`
3. No refresh needed, mutation continues
4. Like should work immediately

## Expected Console Output

### Scenario 1: Fresh Token (Normal Case)
```
[useLikeMutation] Starting like mutation for post: ...
[useLikeMutation] Executing mutation
[Token Check] Token expires in: 3456 seconds
[useLikeMutation] Sending like activity: ...
[useLikeMutation] Like activity sent successfully
```

### Scenario 2: Token Expiring Soon
```
[useLikeMutation] Starting like mutation for post: ...
[useLikeMutation] Executing mutation
[Token Check] Token expires in: 45 seconds
[Token Check] Token expiring soon, refreshing...
[Token Check] Token refreshed successfully
[useLikeMutation] Sending like activity: ...
[useLikeMutation] Like activity sent successfully
```

### Scenario 3: Token Refresh Failed
```
[useLikeMutation] Starting like mutation for post: ...
[useLikeMutation] Executing mutation
[Token Check] Token expires in: 30 seconds
[Token Check] Token expiring soon, refreshing...
[Token Check] Token refresh failed
Error: Token expired and refresh failed. Please login again.
[useLikeMutation] Failed to like post: Error: Token expired...
```

In this case, user needs to logout and login again.

## Network Request Headers (After Fix)

The Authorization header should now always contain a valid token:
```
POST /art/outbox HTTP/2
Host: vandervennet.art
Authorization: Bearer {fresh-access-token}
Content-Type: application/ld+json
Accept: application/ld+json, application/activity+json
```

## Additional Token Management

### When Token Refresh Fails
If you see `[Token Check] Token refresh failed`, the user needs to:
1. Logout completely
2. Login again to get new tokens
3. Try the action again

### Check Refresh Token Exists
```javascript
const auth = window.$nuxt.$pinia._s.get('auth')
console.log('Has refresh token:', !!auth.session?.refreshToken)
```

If no refresh token, the session cannot be refreshed automatically.

## Future Improvements

### Option 1: Retry on 401
Add automatic retry when getting 401:
```typescript
try {
  await sendLikeActivity(...)
} catch (error) {
  if (error.statusCode === 401) {
    // Force refresh and retry once
    await ensureValidToken(auth)
    await sendLikeActivity(...)
  }
}
```

### Option 2: Proactive Token Refresh
Refresh tokens in the background before they expire:
```typescript
// In authStore, check every minute
setInterval(() => {
  if (session.value && session.value.expiresAt < Date.now() + 300000) {
    // Refresh 5 minutes before expiry
    refreshSession(session.value)
  }
}, 60000)
```

### Option 3: Show User Warning
If token expiring soon, show UI notification:
```typescript
if (tokenExpiresIn < 300000) {
  toast.warning('Your session will expire soon. Please save your work.')
}
```

## Debugging 401 Errors

### Step 1: Check Token in Request
In Network tab, check the Authorization header:
- Should start with `Bearer ey...`
- Copy the token (after "Bearer ")
- Paste into https://jwt.io to decode
- Check the `exp` (expiration) claim

### Step 2: Verify Token Not Expired
```javascript
// In browser console
const auth = window.$nuxt.$pinia._s.get('auth')
const token = auth.session.accessToken
const [, payload] = token.split('.')
const decoded = JSON.parse(atob(payload))
console.log('Token expires:', new Date(decoded.exp * 1000).toLocaleString())
console.log('Now:', new Date().toLocaleString())
console.log('Is expired:', decoded.exp * 1000 < Date.now())
```

### Step 3: Check Refresh Token
```javascript
const auth = window.$nuxt.$pinia._s.get('auth')
console.log('Refresh token exists:', !!auth.session?.refreshToken)
console.log('Refresh token:', auth.session?.refreshToken?.substring(0, 20) + '...')
```

### Step 4: Manual Refresh Test
```javascript
const auth = window.$nuxt.$pinia._s.get('auth')
const { refreshSession } = useActivityPodsAuth()
const newSession = await refreshSession(auth.session)
console.log('Refresh successful:', !!newSession)
```

## Common Issues After Fix

### Issue: Still getting 401
**Possible causes**:
1. Refresh token is also expired → Need to login again
2. ActivityPods revoked access → Need to re-authorize app
3. Network issue during token refresh → Check Network tab

**Solution**: Logout and login again to get completely fresh tokens.

### Issue: Token Check says "3600 seconds" but still getting 401
**Cause**: The stored `expiresAt` doesn't match actual token expiry

**Solution**: 
1. Check actual token expiry (Step 2 above)
2. If mismatch, logout and login to resync
3. May need to fix token expiry calculation in `handleCallback()`

### Issue: Refresh happens too often
**Cause**: 60 second threshold too high for your use case

**Solution**: Lower the threshold in `ensureValidToken()`:
```typescript
if (tokenExpiresIn < 30000) { // 30 seconds instead of 60
  // refresh
}
```

## Summary

✅ **Fix Applied**: Auto token refresh before mutations
✅ **Prevents**: 401 errors from expired tokens  
✅ **Logging**: Clear logs for debugging
✅ **User Experience**: Seamless, no login interruption
✅ **Fallback**: Clear error message if refresh fails

The mutation should now work consistently without 401 errors, as long as:
1. User is logged in
2. Refresh token is valid
3. ActivityPods server is reachable

If 401 persists after this fix, it's likely an issue with the ActivityPods server or the token validation logic on their side.
