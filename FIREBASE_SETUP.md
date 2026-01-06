# Firebase Setup Checklist for OdyFeed

## Pre-Setup Requirements
- [ ] Node.js and pnpm installed
- [ ] Firebase account created
- [ ] Google Cloud project access

## Step 1: Firebase Project Setup
- [ ] Go to [Firebase Console](https://console.firebase.google.com)
- [ ] Create new project or select existing one
- [ ] Enable Firestore Database (start in production mode)
- [ ] Enable Authentication (if needed for future features)
- [ ] Create Web App and note the SDK config

## Step 2: Service Account Configuration
- [ ] In Firebase Console, go to Project Settings
- [ ] Navigate to Service Accounts tab
- [ ] Click "Generate New Private Key"
- [ ] Save the JSON file securely (never commit to git)
- [ ] Copy the entire JSON content

## Step 3: Environment Setup
- [ ] Copy `.env.example` to `.env.local`:
  ```bash
  cp .env.example .env.local
  ```

- [ ] Fill in the following from Firebase Console:
  - [ ] `FIREBASE_API_KEY` - Project Settings > General > Web API Key
  - [ ] `FIREBASE_AUTH_DOMAIN` - {projectId}.firebaseapp.com
  - [ ] `FIREBASE_PROJECT_ID` - Your project ID
  - [ ] `FIREBASE_STORAGE_BUCKET` - {projectId}.appspot.com
  - [ ] `FIREBASE_MESSAGING_SENDER_ID` - Project number
  - [ ] `FIREBASE_APP_ID` - Available in project settings

- [ ] For `FIREBASE_SERVICE_ACCOUNT_KEY`:
  - [ ] Paste the entire JSON object as a string
  - [ ] Or set as environment variable before running

- [ ] Set `ODYSSEY_BASE_URL`:
  - [ ] Local dev: `http://localhost:3000`
  - [ ] Production: Your domain (e.g., `https://odyfeed.example.com`)

- [ ] Set `OPENAI_API_KEY`:
  - [ ] Get from [OpenAI API Keys](https://platform.openai.com/api-keys)

## Step 4: Dependencies Installation
```bash
pnpm install
```
- [ ] Verify no errors
- [ ] Check firebase and firebase-admin are installed

## Step 5: Deploy Firebase Configuration
```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Select your project
firebase use --add

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```
- [ ] Confirm rules deployed successfully
- [ ] Confirm indexes deployed successfully

## Step 6: Local Testing
```bash
# Start dev server
pnpm dev
```
- [ ] Server runs without errors
- [ ] No Firebase connection errors in console

## Step 7: Data Migration
```bash
# Option 1: Dry run (recommended first)
curl -X POST http://localhost:3000/api/migrate?dryRun=true

# Option 2: Actual migration
curl -X POST http://localhost:3000/api/migrate
```
- [ ] Migration completes successfully
- [ ] Check Firestore Console for migrated collections:
  - [ ] actors (3 documents expected)
  - [ ] events (5 documents expected)
  - [ ] posts (15+ documents expected)

## Step 8: Generate Content
```bash
# Generate posts via OpenAI seeder
curl -X GET http://localhost:3000/api/seed
```
- [ ] Posts generated successfully
- [ ] New posts visible in Firestore
- [ ] New posts appear on `/` timeline

## Step 9: Test API Endpoints
- [ ] `GET http://localhost:3000/api/timeline` - Returns JSON-LD collection
- [ ] `GET http://localhost:3000/api/data/actors` - Returns all actors
- [ ] `GET http://localhost:3000/api/data/events` - Returns all events
- [ ] `GET http://localhost:3000/api/data/vocab` - Returns vocabulary
- [ ] `GET http://localhost:3000/` - Timeline loads with posts

## Step 10: Production Deployment
```bash
# Build the application
pnpm build

# Deploy to Firebase Hosting
firebase deploy
```
- [ ] Build completes without errors
- [ ] Deployment succeeds
- [ ] Application accessible at Firebase URL
- [ ] Firestore operations work in production

## Optional: Security Hardening
- [ ] Review `firestore.rules` for your specific needs
- [ ] Consider enabling Firestore backups
- [ ] Set up Firestore monitoring and alerts
- [ ] Consider enabling authentication for sensitive endpoints

## Troubleshooting

### Problem: "Cannot find module 'firebase-admin'"
**Solution:**
```bash
pnpm install firebase-admin@latest
```

### Problem: "Firebase service account key not configured"
**Solution:**
- Verify `FIREBASE_SERVICE_ACCOUNT_KEY` is set
- Ensure it's valid JSON (not a file path)
- Check environment variable is accessible to the server

### Problem: Firestore connection fails
**Solution:**
- Verify Firestore is enabled in Firebase Console
- Check project ID matches in config
- Ensure service account has Firestore permissions
- Check network/firewall allows Firestore API calls

### Problem: Migration shows "already exists"
**Solution:**
- This is normal! Migration is idempotent
- Re-running is safe and won't duplicate data

### Problem: Posts don't appear on timeline
**Solution:**
1. Check Firestore Console > posts collection
2. Verify posts have `published` field
3. Check browser console for API errors
4. Verify `attributedTo` field matches actor username

## Support

For issues not covered here, check:
- [DATABASE_REFACTORING.md](./DATABASE_REFACTORING.md) - Detailed architecture docs
- [Firebase Docs](https://firebase.google.com/docs) - Official Firebase documentation
- `.env.example` - Configuration reference
- `firestore.rules` - Security rules

