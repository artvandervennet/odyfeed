# OdyFeed Database Refactoring Guide

## Overview

OdyFeed has been refactored from file-based JSON-LD storage to Firebase Firestore. This document outlines the changes, setup requirements, and migration process.

## What Changed

### Before (File-Based)
- Actors stored in `data/actors/actors.jsonld`
- Events stored in `data/events/events.jsonld`
- Posts stored in `data/posts/{actor}/{postId}.jsonld`
- Inbox activities stored in `data/inbox/{actor}/{id}.jsonld`
- API endpoints read directly from the filesystem

### After (Firestore)
- **Actors collection**: Actor documents with properties (id, preferredUsername, name, summary, tone, avatar, inbox, outbox)
- **Events collection**: Event documents with properties (id, eventId, title, description, sequence, published, involvedActors[])
- **Posts collection**: Post documents with ActivityPub Note structure
  - Subcollection **likes**: Like activities with actor and createdAt
- **Vocab**: Remains file-based (`data/vocab/myth.jsonld`) as it's static
- API endpoints now query Firestore collections

## Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or use existing one
3. Enable Firestore Database
4. Create a service account:
   - Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file securely

### 2. Environment Configuration

Copy `.env.example` to `.env.local` and fill in your Firebase credentials:

```bash
cp .env.example .env.local
```

**Important Firebase Configuration Variables:**

```env
# Public Firebase Config (safe to expose)
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# Private Firebase Admin Config (server-side only)
# Copy the entire JSON from your service account key
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"..."}

# Other configs
ODYSSEY_BASE_URL=http://localhost:3000  # or your production domain
OPENAI_API_KEY=your_openai_key
```

### 3. Install Dependencies

```bash
pnpm install
```

This adds:
- `firebase`: Client SDK for browser operations
- `firebase-admin`: Server-side Admin SDK for Firestore operations

## Data Migration

### Automatic Migration Endpoint

A migration endpoint is available to transfer existing file-based data to Firestore:

```bash
# Test migration (dry run - no data modified)
curl -X POST http://localhost:3000/api/migrate?dryRun=true

# Execute migration
curl -X POST http://localhost:3000/api/migrate
```

The migration will:
1. Read actors from `data/actors/actors.jsonld`
2. Read events from `data/events/events.jsonld`
3. Read posts from `data/posts/{actor}/*.jsonld`
4. Insert all data into respective Firestore collections
5. Skip documents that already exist (idempotent)

### Manual Migration Steps (if needed)

```typescript
import { runFullMigration } from '~/server/utils/migrate'

const results = await runFullMigration()
console.log(results)
// {
//   success: true,
//   actors: { migrated: 3, message: '...' },
//   events: { migrated: 5, message: '...' },
//   posts: { migrated: 15, message: '...' }
// }
```

## Firestore Collections Schema

### Actors Collection
```typescript
{
  id: string                    // e.g., "http://localhost:3000/api/actors/odysseus"
  preferredUsername: string    // e.g., "odysseus"
  name: string                 // e.g., "Odysseus"
  summary: string              // Biography/description
  tone: string                 // Character tone
  avatar: string               // Avatar URL
  inbox: string                // ActivityPub inbox URL
  outbox: string               // ActivityPub outbox URL
  createdAt: Timestamp
}
```

### Events Collection
```typescript
{
  id: string                   // e.g., "http://localhost:3000/events/01-trojan-horse"
  eventId: string              // e.g., "01-trojan-horse"
  title: string                // Event title
  description: string          // Event description
  sequence: number             // Order in timeline
  published: string            // ISO date
  involvedActors: string[]     // Array of preferredUsernames
  createdAt: Timestamp
}
```

### Posts Collection
```typescript
{
  id: string                   // ActivityPub URL
  type: string                 // "Note"
  postId: string               // Unique post identifier
  attributedTo: string         // Actor's preferredUsername
  content: string              // Post content
  published: string            // ISO date
  to: string[]                 // Recipient URIs
  "@context": any[]            // JSON-LD context
  myth:aboutEvent?: string     // Related event ID
  likes: string[]              // Array of like URLs
  createdAt: Timestamp
  updatedAt: Timestamp
  
  // Subcollection: likes
  likes/{docId}:
  {
    actor: string              // Actor username
    createdAt: Timestamp
  }
}
```

## API Endpoints

### Updated Endpoints (now Firestore-backed)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/timeline` | GET | Get all posts sorted by date |
| `/api/data/actors` | GET | Get all actors as JSON-LD |
| `/api/data/events` | GET | Get all events as JSON-LD |
| `/api/data/vocab` | GET | Get vocabulary (still file-based) |
| `/api/seed` | GET | Generate and save new posts via OpenAI |

### New Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/migrate` | POST | Migrate data from files to Firestore |

## Backward Compatibility

The refactoring maintains **full backward compatibility**:

- API response formats unchanged
- JSON-LD context preserved
- ActivityPub compliance maintained
- RDF utilities have fallback to file-based parsing if Firestore fails

## Performance Optimizations

### Firestore Indexes
Three indexes are configured for optimal query performance:

1. **Posts by actor and date**: `attributedTo` + `published DESC`
2. **Posts by date**: `published DESC` (timeline queries)
3. **Events by sequence**: `sequence ASC`

Indexes are defined in `firestore.indexes.json` and deployed via Firebase CLI.

### Cost Optimization
- Posts timeline: Limited to 100 items per query (pagination-ready)
- Seeder: Checks post existence before writing (prevents duplicates)
- Likes: Stored in subcollection (better scaling than array field)

## Security

### Firestore Rules (`firestore.rules`)
- **Actors/Events**: Public read, admin write only
- **Posts**: Public read, authenticated users can manage their own posts
- **Likes**: Public read, authenticated users can add/remove likes

Rules prevent unauthorized data modification while allowing public discovery.

## Development Workflow

### Local Development
1. Set up `.env.local` with Firebase config
2. Run `pnpm install`
3. Run `pnpm dev`
4. Optionally run `/api/migrate` to load sample data
5. Run `/api/seed` to generate posts via OpenAI

### Production Deployment
1. Configure environment variables in Firebase project settings
2. Deploy rules: `firebase deploy --only firestore:rules`
3. Deploy indexes: `firebase deploy --only firestore:indexes`
4. Deploy app: `firebase deploy`
5. Run migration if needed (safe to run multiple times)

## Troubleshooting

### "Firebase service account key not configured"
- Ensure `FIREBASE_SERVICE_ACCOUNT_KEY` environment variable is set
- Check it's a valid JSON string (not a file path)

### Firestore queries failing, falling back to files
- Check Firebase credentials
- Ensure Firestore database is created in Firebase Console
- Verify network connectivity to Firestore

### Migration skips documents
- This is normal! Migration is idempotent
- Documents matching `postId + attributedTo` or `eventId` are skipped
- Safe to run multiple times

### No posts appearing on timeline
1. Ensure posts were created via `/api/seed` or migration
2. Check Firestore console for posts collection
3. Verify `published` field exists on all posts
4. Check browser console for API errors

## File Structure Changes

### Removed (no longer needed)
- `data/` folder structure for posts (can delete after migration)
- File-based post storage logic

### New Files
- `server/utils/firebase.ts` - Firebase Admin SDK initialization
- `server/utils/firestore.ts` - Firestore data access layer
- `server/utils/migrate.ts` - Migration utilities
- `server/api/migrate.post.ts` - Migration endpoint
- `firestore.rules` - Security rules
- `firestore.indexes.json` - Query indexes
- `.env.example` - Configuration template

### Modified Files
- `package.json` - Added firebase dependencies
- `nuxt.config.ts` - Added Firebase config, removed data copy hook
- `server/utils/rdf.ts` - Added Firestore fallback
- `server/api/seed.get.ts` - Writes to Firestore
- `server/api/timeline.get.ts` - Reads from Firestore
- `server/api/data/*.get.ts` - Read from Firestore
- `firebase.json` - Added Firestore rules/indexes

## Next Steps

1. ✅ Install dependencies: `pnpm install`
2. ✅ Set up Firebase project in console
3. ✅ Configure `.env.local` with credentials
4. ✅ Deploy Firestore rules and indexes
5. ✅ Run migration: `POST /api/migrate`
6. ✅ Test endpoints to verify data loads
7. ✅ Deploy to Firebase: `firebase deploy`

## Additional Resources

- [Firebase Firestore Documentation](https://firebase.google.com/docs/firestore)
- [ActivityPub Specification](https://www.w3.org/TR/activitypub/)
- [JSON-LD Documentation](https://json-ld.org/)
- [Nuxt 3 Documentation](https://nuxt.com/docs)

