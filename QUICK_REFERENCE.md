# OdyFeed Firebase Refactoring - Quick Reference

## 🚀 Quick Start (5 minutes)

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Copy Environment Template
```bash
cp .env.example .env.local
```

### 3. Configure Firebase
- Get credentials from [Firebase Console](https://console.firebase.google.com)
- Fill in all `FIREBASE_*` variables in `.env.local`

### 4. Deploy Rules & Indexes
```bash
firebase login
firebase use --add  # Select your project
firebase deploy --only firestore:rules,firestore:indexes
```

### 5. Run Migration
```bash
pnpm dev
# In another terminal:
curl -X POST http://localhost:3000/api/migrate
```

Done! Your data is now in Firestore. 🎉

---

## 📁 What Changed

### New Files
| File | Purpose |
|------|---------|
| `server/utils/firebase.ts` | Firebase Admin SDK init |
| `server/utils/firestore.ts` | Data access layer |
| `server/utils/migrate.ts` | Migration helpers |
| `server/api/migrate.post.ts` | Migration endpoint |
| `.env.example` | Config template |
| `firestore.rules` | Security rules |
| `firestore.indexes.json` | Query indexes |
| `FIREBASE_SETUP.md` | Setup guide |
| `DATABASE_REFACTORING.md` | Architecture docs |
| `REFACTORING_SUMMARY.md` | Detailed summary |

### Modified Files
| File | Change |
|------|--------|
| `package.json` | Added firebase dependencies |
| `nuxt.config.ts` | Added Firebase config |
| `server/utils/rdf.ts` | Firestore + fallback |
| `server/api/seed.get.ts` | Writes to Firestore |
| `server/api/timeline.get.ts` | Reads from Firestore |
| `server/api/data/*.ts` | Read from Firestore |
| `firebase.json` | Added rules/indexes |

### Unchanged
- ✅ All API responses (JSON-LD format)
- ✅ Vocabulary (still file-based)
- ✅ Vue components
- ✅ Styling
- ✅ ActivityPub compliance

---

## 🔑 Environment Variables

```env
# Firebase Config (from console.firebase.google.com)
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=

# Firebase Admin (from Service Accounts > Generate Private Key)
FIREBASE_SERVICE_ACCOUNT_KEY=

# Application
ODYSSEY_BASE_URL=http://localhost:3000
OPENAI_API_KEY=
```

See `.env.example` for details.

---

## 🗄️ Firestore Collections

```
/actors           → Actor documents
/events           → Event documents
/posts            → Post documents
  /posts/{id}/likes → Like documents
/vocab            → (still file-based)
```

**Note:** No need to manually create collections. Firestore auto-creates on first write.

---

## 🔗 Key API Endpoints

| Endpoint | Method | Returns |
|----------|--------|---------|
| `/api/timeline` | GET | All posts (JSON-LD) |
| `/api/data/actors` | GET | All actors (JSON-LD) |
| `/api/data/events` | GET | All events (JSON-LD) |
| `/api/data/vocab` | GET | Vocabulary (JSON-LD) |
| `/api/seed` | GET | Generate posts (OpenAI) |
| `/api/migrate` | POST | Migrate files → Firestore |

---

## 📊 Migration

### Automatic (Recommended)
```bash
# Dry run (preview what will happen)
curl -X POST http://localhost:3000/api/migrate?dryRun=true

# Actual migration
curl -X POST http://localhost:3000/api/migrate
```

### What Gets Migrated
- ✅ Actors from `data/actors/actors.jsonld`
- ✅ Events from `data/events/events.jsonld`
- ✅ Posts from `data/posts/{actor}/*.jsonld`
- ⏭️ Vocabulary remains file-based

### Idempotent
Safe to run multiple times. Won't create duplicates.

---

## 🔐 Security

**Firestore Rules** (`firestore.rules`):
- Actors/Events: Public read, admin write
- Posts: Public read, user can modify own
- Likes: Public read, authenticated write

**Admin SDK** (`FIREBASE_SERVICE_ACCOUNT_KEY`):
- Server-only access
- Never expose to client
- Keep out of version control

---

## 🧪 Testing

```bash
# Start development server
pnpm dev

# Test endpoints
curl http://localhost:3000/api/timeline
curl http://localhost:3000/api/data/actors
curl http://localhost:3000/api/data/events

# Migrate data
curl -X POST http://localhost:3000/api/migrate

# Generate new posts
curl http://localhost:3000/api/seed
```

---

## 🚨 Troubleshooting

### "Firebase service account key not configured"
- Check `.env.local` has `FIREBASE_SERVICE_ACCOUNT_KEY`
- Ensure it's valid JSON (from Service Accounts > Private Key)
- Verify it's accessible to the server

### "Firestore queries failing"
- Confirm Firestore enabled in Firebase Console
- Check network connectivity to Google Cloud
- Verify credentials are correct
- Check `server/utils/firebase.ts` logs

### No data in Firestore after migration
1. Check migration endpoint response
2. Visit Firestore Console > verify collections exist
3. Check for error messages in server logs
4. Ensure service account has Firestore permissions

### Posts not showing on timeline
1. Confirm posts created: `POST /api/migrate`
2. Verify in Firestore Console
3. Check `published` field exists
4. Look for API errors in browser console

---

## 📚 Documentation

| File | Contains |
|------|----------|
| `REFACTORING_SUMMARY.md` | High-level overview |
| `DATABASE_REFACTORING.md` | Architecture & schema |
| `FIREBASE_SETUP.md` | Detailed setup steps |
| `.env.example` | Configuration reference |
| `firestore.rules` | Security rules code |

---

## ✅ Deployment Checklist

- [ ] Firebase project created
- [ ] Service account key generated
- [ ] `.env.local` configured with all keys
- [ ] `pnpm install` completed
- [ ] `firebase deploy --only firestore:rules,firestore:indexes` successful
- [ ] `pnpm dev` runs without errors
- [ ] `/api/migrate` completes successfully
- [ ] Data visible in Firestore Console
- [ ] Timeline loads at `/`
- [ ] All API endpoints work
- [ ] Production build: `pnpm build` succeeds
- [ ] Production deploy: `firebase deploy` succeeds

---

## 🎯 One Command Setup (after getting Firebase credentials)

```bash
# Install & configure
pnpm install && cp .env.example .env.local
# (Edit .env.local with your Firebase credentials)

# Deploy configuration
firebase login && firebase use --add && firebase deploy --only firestore:rules,firestore:indexes

# Start & migrate
pnpm dev
# In another terminal:
curl -X POST http://localhost:3000/api/migrate

# Done! Visit http://localhost:3000
```

---

**Questions?** See `FIREBASE_SETUP.md` for detailed steps.

