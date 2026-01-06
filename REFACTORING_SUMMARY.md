# OdyFeed Database Refactoring - Summary

## What Was Done

Your OdyFeed application has been successfully refactored from file-based JSON-LD storage to Firebase Firestore. This makes it production-ready for Firebase deployment.

## Key Changes

### 1. **Dependencies Added** (`package.json`)
```json
{
  "firebase": "^11.1.0",
  "firebase-admin": "^13.0.0"
}
```

### 2. **New Files Created**

#### Server Utilities
- **`server/utils/firebase.ts`** - Firebase Admin SDK initialization
  - Handles service account authentication
  - Provides singleton Firestore instance
  
- **`server/utils/firestore.ts`** - Data access layer
  - `getActor()`, `getAllActors()` - Fetch actor documents
  - `getEvent()`, `getAllEvents()` - Fetch event documents
  - `getPost()`, `getAllPosts()` - Fetch post documents
  - `createPost()`, `postExists()` - Create and check posts
  - `addLike()`, `removeLike()`, `getLikesCount()` - Like management
  
- **`server/utils/migrate.ts`** - Data migration utilities
  - `migrateActorsFromFiles()` - Import actors from JSON-LD
  - `migrateEventsFromFiles()` - Import events from JSON-LD
  - `migratePostsFromFiles()` - Import posts from filesystem
  - `runFullMigration()` - Execute complete migration

#### API Endpoints
- **`server/api/migrate.post.ts`** - Migration endpoint
  - Supports dry-run mode (`?dryRun=true`)
  - Safe to call multiple times (idempotent)

#### Configuration Files
- **`.env.example`** - Environment variables template
  - Firebase configuration keys
  - OpenAI API key
  - Base URL settings

- **`firestore.rules`** - Security rules
  - Public read access for actors/events/posts
  - Admin-only write for actors/events
  - User-owned post management
  - Like functionality with authentication

- **`firestore.indexes.json`** - Query indexes
  - Posts by actor + date (optimizes actor timeline)
  - Posts by date (optimizes main timeline)
  - Events by sequence (optimizes event listing)

- **`firebase.json`** - Updated with Firestore config
  - Points to security rules file
  - Points to indexes file

#### Documentation
- **`DATABASE_REFACTORING.md`** - Detailed architecture documentation
  - Schema descriptions
  - API endpoint reference
  - Performance optimization details
  - Security explanations
  
- **`FIREBASE_SETUP.md`** - Step-by-step setup guide
  - Firebase project creation
  - Environment configuration
  - Migration walkthrough
  - Troubleshooting guide

### 3. **Modified Files**

#### `nuxt.config.ts`
- ✅ Removed file copy hook (no longer needed)
- ✅ Added Firebase runtime config
- ✅ Added public Firebase credentials for client
- ✅ Added private Firebase admin config for server

#### `server/utils/rdf.ts`
- ✅ Updated `parseActors()` to use Firestore with file fallback
- ✅ Updated `parseEvents()` to use Firestore with file fallback
- ✅ Maintains backward compatibility if Firestore fails

#### `server/api/seed.get.ts`
- ✅ Writes generated posts to Firestore instead of files
- ✅ Uses Firestore existence check instead of file check
- ✅ Maintains identical behavior otherwise

#### `server/api/timeline.get.ts`
- ✅ Fetches posts from Firestore instead of filesystem
- ✅ Enriches posts with actor data
- ✅ Returns identical JSON-LD format

#### `server/api/data/actors.get.ts`
- ✅ Fetches from Firestore actors collection
- ✅ Reconstructs JSON-LD format on-the-fly
- ✅ No file dependency

#### `server/api/data/events.get.ts`
- ✅ Fetches from Firestore events collection
- ✅ Reconstructs JSON-LD format on-the-fly
- ✅ Maintains sequence ordering

#### `server/api/data/vocab.get.ts`
- ✅ Remains file-based (vocabulary is static)
- ✅ Added comment explaining design choice

## Firestore Data Structure

### Collections

**actors**
```
- id: string (ActivityPub URL)
- preferredUsername: string (unique identifier)
- name: string
- summary: string
- tone: string
- avatar: string
- inbox: string (ActivityPub endpoint)
- outbox: string (ActivityPub endpoint)
- createdAt: Timestamp
```

**events**
```
- id: string (ActivityPub URL)
- eventId: string (unique identifier)
- title: string
- description: string
- sequence: number
- published: string (ISO date)
- involvedActors: string[] (array of usernames)
- createdAt: Timestamp
```

**posts**
```
- id: string (ActivityPub URL)
- type: string ("Note")
- postId: string
- attributedTo: string (actor username)
- content: string
- published: string (ISO date)
- to: string[] (recipient URIs)
- @context: any[] (JSON-LD context)
- myth:aboutEvent?: string
- likes: string[]
- createdAt: Timestamp
- updatedAt: Timestamp

  Subcollection: likes/
  - actor: string
  - createdAt: Timestamp
```

## Migration Process

The migration is **automatic and idempotent**:

1. Reads from existing JSON-LD files in `data/` folder
2. Inserts into Firestore collections
3. Skips documents that already exist
4. Safe to run multiple times
5. Original files remain untouched (can be deleted after verification)

**To run migration:**
```bash
# Dry run (test without modifying)
POST http://localhost:3000/api/migrate?dryRun=true

# Actual migration
POST http://localhost:3000/api/migrate
```

## Backward Compatibility

✅ **All API responses remain unchanged:**
- JSON-LD format preserved
- ActivityPub compliance maintained
- Same endpoint URLs
- Same response structure

✅ **Graceful degradation:**
- If Firestore fails, falls back to file-based parsing
- Ensures uptime during migration

## Benefits of This Refactoring

1. **Production-Ready** - Firebase handles scaling, backups, security
2. **Real-Time Capable** - Firestore listeners for live updates in future
3. **Serverless** - No database server to manage
4. **Cost-Effective** - Pay only for operations
5. **Secure** - Built-in authentication and rules engine
6. **Queryable** - Complex queries without file parsing
7. **Scalable** - Handles millions of documents efficiently

## What Still Uses Files

- **Vocabulary** (`data/vocab/myth.jsonld`) - Kept as-is (static data)
- **Static assets** (`public/`, `app/assets/`) - Unchanged
- **Configuration** (new `.env` system instead of hardcoded)

## Next Steps

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up Firebase:**
   - Create project at console.firebase.google.com
   - Get service account key
   - Copy `.env.example` to `.env.local`
   - Fill in all Firebase credentials

3. **Deploy configuration:**
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes
   ```

4. **Run migration:**
   ```bash
   curl -X POST http://localhost:3000/api/migrate
   ```

5. **Test endpoints:**
   - Visit `http://localhost:3000` - Should show timeline
   - Check `/api/timeline` - JSON-LD collection
   - Check `/api/data/actors` - All actors
   - Check `/api/data/events` - All events

6. **Deploy to Firebase:**
   ```bash
   pnpm build
   firebase deploy
   ```

## File Organization (No Breaking Changes)

The `data/` folder structure remains for backward compatibility:
- `data/actors/actors.jsonld` - Source for migration
- `data/events/events.jsonld` - Source for migration
- `data/posts/` - Source for migration
- `data/vocab/myth.jsonld` - Still used (can migrate later if needed)

**Can safely delete after verifying migration:**
- `data/posts/` - Once migrated
- `data/inbox/` - If exists (not part of current schema)

## Configuration Reference

### Required Environment Variables

```env
# Firebase
FIREBASE_API_KEY=pk_...
FIREBASE_AUTH_DOMAIN=project.firebaseapp.com
FIREBASE_PROJECT_ID=project-id
FIREBASE_STORAGE_BUCKET=project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abc...
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}

# Application
ODYSSEY_BASE_URL=http://localhost:3000
OPENAI_API_KEY=sk-...
```

See `.env.example` for complete reference.

## Security Notes

✅ Service account key stored only on server (via `FIREBASE_SERVICE_ACCOUNT_KEY`)
✅ Public Firebase config available to client (safe keys only)
✅ Firestore rules enforce data access policies
✅ Admin operations protected by service account

**Important:** Never commit `.env.local` or service account keys to git!

## Testing Checklist

- [ ] Installed dependencies without errors
- [ ] Set up Firebase project
- [ ] Configured environment variables
- [ ] Server starts: `pnpm dev`
- [ ] Migration runs successfully: `POST /api/migrate`
- [ ] Firestore console shows collections with data
- [ ] Timeline loads at `http://localhost:3000`
- [ ] Seed endpoint works: `GET /api/seed`
- [ ] API endpoints return correct data
- [ ] Production build succeeds: `pnpm build`
- [ ] Firebase deployment works: `firebase deploy`

## Support Documentation

- **Setup Guide:** `FIREBASE_SETUP.md`
- **Architecture Details:** `DATABASE_REFACTORING.md`
- **Environment Example:** `.env.example`
- **Security Rules:** `firestore.rules`
- **Query Indexes:** `firestore.indexes.json`

---

**Status:** ✅ Ready for Firebase deployment
**Compatible with:** Nuxt 3, Vue 3, TypeScript
**Database:** Google Cloud Firestore

