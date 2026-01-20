# OdyFeed 🏛️

> A decentralized social network that brings Greek mythology to the modern web through ActivityPub federation, Solid Pod storage, and Webmentions.

Experience the Odyssey like never before—where Odysseus, Poseidon, and Athena share their stories across the federated web, all while your data remains sovereign in your personal Solid Pod.

[![Nuxt](https://img.shields.io/badge/Nuxt-4.2-00DC82?style=flat&logo=nuxt.js)](https://nuxt.com/)
[![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D?style=flat&logo=vue.js)](https://vuejs.org/)
[![ActivityPub](https://img.shields.io/badge/ActivityPub-W3C-purple?style=flat)](https://www.w3.org/TR/activitypub/)
[![Solid](https://img.shields.io/badge/Solid-Protocol-7C4DFF?style=flat)](https://solidproject.org/)

---

## Table of Contents

1. [What is OdyFeed?](#what-is-odyfeed)
2. [Features](#features)
3. [Setup & Development](#setup--development)
   - [Prerequisites](#prerequisites)
   - [Environment Variables](#environment-variables)
   - [Installation](#installation)
   - [Running the Application](#running-the-application)
4. [Project Structure](#project-structure)
   - [Frontend Architecture](#frontend-architecture)
   - [Backend Architecture](#backend-architecture)
   - [Shared Resources](#shared-resources)
5. [Technologies Deep Dive](#technologies-deep-dive)
   - [ActivityPub Federation](#activitypub-federation)
   - [Solid Pod Integration](#solid-pod-integration)
   - [Webmentions](#webmentions)
   - [Linked Data (RDF)](#linked-data-rdf)
6. [Common Pitfalls & Troubleshooting](#common-pitfalls--troubleshooting)
7. [Testing & Verification](#testing--verification)
8. [Deployment Considerations](#deployment-considerations)
9. [Contributing](#contributing)
10. [Resources & Further Reading](#resources--further-reading)

---

## What is OdyFeed?

**OdyFeed** is an educational demonstration of modern decentralized web technologies, showcasing how to build a federated social network that respects user privacy and data sovereignty. It combines three powerful protocols:

- **🌐 ActivityPub**: For federated social networking (compatible with Mastodon, Pleroma, and other fediverse platforms)
- **🔒 Solid Pods**: For user-controlled data storage with fine-grained access control
- **💬 Webmentions**: For decentralized comments and interactions across the web

The application tells the story of Homer's Odyssey through the eyes of mythological characters (Odysseus, Poseidon, Athena), who "post" about events as they unfold. Users can authenticate with their Solid Pod, create posts, interact with content, and federate with other ActivityPub servers—all while maintaining full control over their data.

### Why OdyFeed?

This project was created as a learning resource and proof-of-concept for:

- Understanding ActivityPub federation mechanics (inbox/outbox, HTTP signatures, actor discovery)
- Implementing Solid OIDC authentication and Pod storage operations
- Working with RDF/Turtle and Linked Data principles
- Building a modern web application with Vue 3, Nuxt, and TypeScript
- Exploring decentralized web standards in a practical context

---

## Features

### Core Functionality

✅ **Federated Social Networking**
- Full ActivityPub implementation (Follow, Like, Reply, Announce)
- HTTP Signature verification for secure federation
- Compatible with Mastodon and other fediverse platforms

✅ **Solid Pod Integration**
- OAuth 2.0 / OIDC authentication with any Solid provider
- Automatic Pod container creation with proper ACL permissions
- Activity storage in user's Pod (inbox/outbox as JSON-LD files)
- Profile data stored as RDF/Turtle

✅ **Webmention Support**
- Receive webmentions on posts
- Parse microformats2 (h-entry, h-card)
- Automatic validation and storage

✅ **Mythological Narrative**
- Pre-defined actors (Greek gods) with unique personalities
- Story events from the Odyssey served as Linked Data
- AI-generated posts (OpenAI) that match character tone
- Timeline grouped by narrative events

✅ **Modern Web UI**
- Vue 3 Composition API with `<script setup>`
- Nuxt 4 with SSR disabled (client-side rendering)
- Nuxt UI components with Tailwind CSS
- Dark mode support
- Responsive design

---

## Setup & Development

### Prerequisites

Ensure you have the following installed:

- **Node.js** v18+ (LTS recommended)
- **pnpm** v8+ (Package manager)
- **A Solid Pod** (get one from [solidcommunity.net](https://solidcommunity.net/) or [inrupt.net](https://inrupt.net/))

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Application Base URL
# CRITICAL: This must match your deployment domain!
# For local development:
BASE_URL=http://localhost:3000

# For production (example):
# BASE_URL=https://odyfeed.example.com

# OpenAI API Key (optional, for AI-generated posts)
# Get your key from https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your-api-key-here

# ActivityPub Pagination (optional, defaults to 20)
ACTIVITYPUB_PAGE_SIZE=20
```

#### Important Notes

- **BASE_URL**: The `clientid.jsonld` file is automatically generated from this value. Solid providers use this URL for OAuth redirects.
- **OPENAI_API_KEY**: Only required if you want AI-generated posts during user registration. The app works without it, but sample posts will use fallback content.

### Installation

```powershell
# Clone the repository
git clone https://github.com/yourusername/OdyFeed.git
cd OdyFeed

# Install dependencies
pnpm install

# Verify installation
pnpm run dev
```

### Running the Application

#### Development Mode

```powershell
pnpm run dev
```

The application will be available at `http://localhost:3000`.

#### Production Build

```powershell
# Build the application
pnpm run build

# Preview production build
pnpm run preview
```

#### Generate Static Site (Not Recommended)

```powershell
pnpm run generate
```

> ⚠️ **Note**: Since OdyFeed uses Solid authentication (client-side only), static generation has limited use. Keep `ssr: false` in `nuxt.config.ts`.

---

## Project Structure

```
OdyFeed/
├── app/                          # Frontend application
│   ├── api/                      # Client-side API functions
│   │   ├── activities.ts         # ActivityPub activity creators
│   │   ├── actors.ts             # Actor profile fetching
│   │   ├── auth.ts               # Authentication API calls
│   │   └── timeline.ts           # Timeline data fetching
│   ├── assets/
│   │   └── css/
│   │       └── main.css          # Global styles & CSS variables
│   ├── components/
│   │   ├── Actor/                # Actor-specific components
│   │   ├── atoms/                # Atomic UI components
│   │   ├── Form/                 # Form components
│   │   ├── Post/                 # Post display components
│   │   ├── Webmention/           # Webmention components
│   │   ├── AppHeader.vue
│   │   ├── AppFooter.vue
│   │   └── ...
│   ├── composables/              # Vue composables (reusable logic)
│   │   ├── useAuth.ts            # Authentication state & actions
│   │   ├── useAuthProviders.ts   # Solid provider discovery
│   │   ├── useModal.ts           # Modal management
│   │   ├── usePostActions.ts     # Like/Reply/Share actions
│   │   └── ...
│   ├── layouts/
│   │   └── default.vue           # Default layout with header/footer
│   ├── middleware/
│   │   └── auth.ts               # Route authentication guard
│   ├── mutations/                # Pinia Colada mutations (writes)
│   │   ├── auth.ts               # Login/logout/register mutations
│   │   ├── like.ts               # Like/unlike mutations
│   │   ├── reply.ts              # Reply creation mutation
│   │   └── webmention.ts         # Webmention sending mutation
│   ├── pages/                    # Nuxt pages (routes)
│   │   ├── index.vue             # Home timeline
│   │   ├── about.vue             # About page
│   │   ├── inbox.vue             # User inbox
│   │   ├── profile.vue           # User profile
│   │   ├── register.vue          # Registration page
│   │   └── ...
│   ├── plugins/
│   │   ├── auth-session.client.ts # Initialize auth session
│   │   └── solid-vcard.client.ts  # Register Solid vCard web component
│   ├── queries/                  # Pinia Colada queries (reads)
│   │   ├── auth.ts               # Auth status query
│   │   ├── inbox.ts              # User inbox query
│   │   ├── post.ts               # Single post query
│   │   ├── replies.ts            # Post replies query
│   │   ├── timeline.ts           # Timeline query
│   │   └── webmentions.ts        # Webmentions query
│   ├── stores/
│   │   └── authStore.ts          # Pinia auth state (central store)
│   ├── types/
│   │   ├── index.ts              # Type definitions
│   │   └── oidc.ts               # OIDC-specific types
│   └── utils/
│       ├── authHelper.ts         # Auth utility functions
│       ├── fetch.ts              # Custom fetch wrapper
│       ├── oidc.ts               # OIDC utilities
│       ├── postHelpers.ts        # Post formatting helpers
│       ├── queryKeys.ts          # Query key factory
│       ├── rdf.ts                # RDF parsing (client-side)
│       └── solidHelpers.ts       # Solid Pod helpers
│
├── server/                       # Backend (Nitro API)
│   ├── api/
│   │   ├── actors/
│   │   │   └── [username]/
│   │   │       ├── index.get.ts       # Actor profile endpoint
│   │   │       ├── inbox.get.ts       # Get user inbox (private)
│   │   │       ├── inbox.post.ts      # Receive federated activities
│   │   │       ├── outbox.get.ts      # Get user outbox (public)
│   │   │       ├── outbox.post.ts     # Send activities (federation)
│   │   │       └── status/
│   │   │           └── [id].get.ts    # Individual post endpoint
│   │   ├── auth/
│   │   │   ├── callback.get.ts        # OAuth callback handler
│   │   │   ├── login.post.ts          # Initiate Solid login
│   │   │   ├── logout.post.ts         # Clear session
│   │   │   ├── register.post.ts       # Register new user
│   │   │   └── status.get.ts          # Check auth status
│   │   ├── timeline.get.ts            # Aggregated timeline
│   │   └── webmentions/
│   │       ├── index.get.ts           # List webmentions
│   │       └── index.post.ts          # Receive webmention
│   ├── middleware/
│   │   ├── auth.ts                    # Inject auth context
│   │   └── errorHandler.ts            # Global error logging
│   ├── routes/
│   │   ├── .well-known/
│   │   │   └── webfinger.ts           # WebFinger endpoint (federation)
│   │   ├── actors.ts                  # Serve actors.ttl
│   │   ├── clientid.jsonld.ts         # OIDC client document
│   │   ├── events.ts                  # Serve events.ttl
│   │   └── vocab.ts                   # Serve vocabulary
│   └── utils/                         # Server utilities
│       ├── aclGenerator.ts            # Generate Solid ACL rules
│       ├── actorEndpointHelpers.ts    # ActivityPub helpers
│       ├── actorHelpers.ts            # Actor profile generation
│       ├── authHelpers.ts             # Auth validation
│       ├── crypto.ts                  # RSA key generation, HTTP signing
│       ├── federation.ts              # ActivityPub federation logic
│       ├── fileStorage.ts             # Local file storage wrapper
│       ├── httpSignature.ts           # HTTP Signature verification
│       ├── logger.ts                  # Structured logging
│       ├── microformats.ts            # Webmention microformat parsing
│       ├── podStorage.ts              # Solid Pod read/write operations
│       ├── postGenerator.ts           # Generate mythological posts (AI)
│       ├── rdf.ts                     # RDF/Turtle parsing
│       ├── sessionCookie.ts           # Session cookie management
│       ├── sessionStorage.ts          # Session persistence
│       ├── solidSession.ts            # Solid Session hydration
│       ├── solidStorage.ts            # Solid storage backend
│       └── typeIndexGenerator.ts      # Generate Solid Type Indexes
│
├── shared/                       # Shared between client & server
│   ├── constants.ts              # Namespaces, endpoints, defaults
│   └── types/
│       ├── activitypub.ts        # ActivityPub interfaces
│       ├── api.ts                # API request/response types
│       ├── base.ts               # Base types
│       ├── index.ts              # Type exports
│       ├── mappers.ts            # Data transformation utilities
│       ├── mutations.ts          # Mutation payload types
│       ├── solid.ts              # Solid ACL types
│       └── webmention.ts         # Webmention types
│
├── public/                       # Static assets
│   ├── actors.ttl                # Mythological actors (Greek gods)
│   ├── events.ttl                # Mythological events (Odyssey)
│   ├── vocab.ttl                 # Custom RDF vocabulary
│   ├── favicon.ico
│   └── robots.txt
│
├── data/                         # Runtime data (not in version control)
│   ├── sessions/                 # User session metadata
│   ├── solid-sessions/           # Solid session storage (DPoP keys)
│   ├── posts/                    # Published posts (JSON-LD)
│   └── users/
│       └── webid-mappings.json   # WebID → username → actorId mappings
│
├── logs/
│   └── activitypub.log           # Application logs
│
├── .env                          # Environment variables
├── .env.example                  # Environment template
├── nuxt.config.ts                # Nuxt configuration
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
└── eslint.config.mjs
```

### Frontend Architecture

**Framework**: Nuxt 4 (Vue 3 + Composition API)

**Key Patterns**:
- **Composition API**: All components use `<script setup>` for cleaner, more maintainable code
- **Pinia Colada**: Data fetching with queries (reads) and mutations (writes)
- **Composables**: Reusable logic extracted into `composables/` directory
- **Atomic Design**: Components organized by complexity (atoms → molecules → organisms)

**State Management**:
- **Pinia**: Central auth store (`authStore.ts`)
- **Pinia Colada**: Query caching with automatic invalidation

**Styling**:
- **Nuxt UI**: Pre-built components with Tailwind CSS
- **Modern CSS**: Native nesting, CSS variables, logical properties
- **Dark Mode**: Full theme support

### Backend Architecture

**Framework**: Nitro (Nuxt's server engine)

**Key Responsibilities**:
1. **ActivityPub Federation**: Handle inbox/outbox, HTTP signatures, actor serving
2. **Solid Pod Operations**: Read/write to user Pods, manage sessions
3. **Webmention Processing**: Receive, validate, store webmentions
4. **API Endpoints**: Serve timeline, auth, and data endpoints

**Data Storage**:
- **Solid Pods**: User data (posts, profile, activities)
- **Local Filesystem**: Sessions, mappings, webmentions, published posts
- **In-Memory**: Active session cache (DPoP keys)

### Shared Resources

**Constants** (`shared/constants.ts`):
- Namespaces (ActivityStreams, Solid, FOAF, etc.)
- Activity types (Note, Like, Follow, etc.)
- File paths, Pod containers, endpoint paths

**Types** (`shared/types/`):
- TypeScript interfaces for ActivityPub objects
- Solid Pod ACL configurations
- API request/response types
- Webmention structures

---

## Technologies Deep Dive

### ActivityPub Federation

ActivityPub is a W3C recommendation for decentralized social networking. OdyFeed implements both the Client-to-Server (C2S) and Server-to-Server (S2S) protocols.

#### How It Works

1. **Actor Discovery**: Each user has a unique actor ID (e.g., `https://odyfeed.example.com/api/actors/alice`)
2. **Inbox/Outbox**: Actors have an inbox (receive) and outbox (send) for activities
3. **Federation**: Activities are sent to remote servers with HTTP Signatures for authentication
4. **Collections**: Followers, following, and posts are served as ActivityStreams Collections

#### Core Endpoints

| Endpoint | Method | Description | Public? |
|----------|--------|-------------|---------|
| `/api/actors/:username` | GET | Actor profile (Person object) | ✅ Yes |
| `/api/actors/:username/inbox` | GET | User's inbox (paginated) | ❌ Auth required |
| `/api/actors/:username/inbox` | POST | Receive activities from remote servers | ✅ Yes (with HTTP Signature) |
| `/api/actors/:username/outbox` | GET | User's outbox (paginated) | ✅ Yes |
| `/api/actors/:username/outbox` | POST | Send activities (Like, Reply, etc.) | ❌ Auth required |
| `/api/actors/:username/status/:id` | GET | Individual post | ✅ Yes |
| `/.well-known/webfinger` | GET | WebFinger discovery | ✅ Yes |

#### HTTP Signatures

All federated activities are signed using RSA-SHA256. Each actor has a public/private key pair stored in their Solid Pod (`/settings/keys.json`).

**Signature Process**:
1. Generate request digest (SHA-256 hash of body)
2. Create signing string from HTTP headers
3. Sign with RSA private key
4. Include `Signature` header with request

**Example Signature Header**:
```
Signature: keyId="https://odyfeed.example.com/api/actors/alice#main-key",
           algorithm="rsa-sha256",
           headers="(request-target) host date digest content-type",
           signature="Base64EncodedSignature=="
```

**Implementation**: See `server/utils/crypto.ts` and `server/utils/httpSignature.ts`

#### Inbox Flow (Receiving Activities)

```typescript
// server/api/actors/[username]/inbox.post.ts

1. Receive activity from remote server
   ↓
2. Verify HTTP Signature
   - Fetch sender's public key from their actor profile
   - Validate signature matches body and headers
   ↓
3. Save activity to user's Solid Pod
   - Store at /social/inbox/{activityId}.json
   ↓
4. Process activity based on type
   - Follow → Auto-send Accept activity
   - Like → Update post likes collection
   - Create (Reply) → Add to post replies
   ↓
5. Return 202 Accepted
```

#### Outbox Flow (Sending Activities)

```typescript
// server/api/actors/[username]/outbox.post.ts

1. Client sends activity to user's outbox
   ↓
2. Validate user owns the outbox (auth check)
   ↓
3. Save activity to user's Solid Pod
   - Store at /social/outbox/{activityId}.json
   ↓
4. Extract recipients (to, cc fields)
   ↓
5. Dereference recipient actors
   - Fetch each recipient's actor profile
   - Extract their inbox URL
   ↓
6. Federate activity to each inbox
   - Sign request with user's private key
   - POST to remote inbox
   - Handle delivery failures gracefully
   ↓
7. Return federation results
   {
     id: savedUrl,
     federated: { total: 5, successful: 4, failed: 1 }
   }
```

**Implementation**: See `server/utils/federation.ts`

#### Mastodon Compatibility

OdyFeed is compatible with Mastodon and other fediverse platforms. To ensure interoperability:

**Required Features**:
- ✅ WebFinger endpoint (`/.well-known/webfinger`)
- ✅ Actor profile with `publicKey` field
- ✅ HTTP Signatures on all federated requests
- ✅ `Content-Type: application/ld+json; profile="https://www.w3.org/ns/activitystreams"`
- ✅ Proper `@context` with Mastodon extensions (toot namespace)

**Mastodon-Specific Context Extensions**:
```json
{
  "@context": [
    "https://www.w3.org/ns/activitystreams",
    {
      "toot": "http://joinmastodon.org/ns#",
      "sensitive": "as:sensitive",
      "votersCount": "toot:votersCount"
    }
  ]
}
```

**Testing Federation with Mastodon**:
1. Deploy OdyFeed to a public HTTPS domain
2. From Mastodon, search for `@yourname@yourdomain.com`
3. Follow the OdyFeed user
4. OdyFeed should auto-accept the follow
5. Post from OdyFeed should appear in your Mastodon timeline

**Common Issues**:
- **WebFinger must use HTTPS**: Mastodon won't federate with HTTP-only servers
- **Clock skew**: HTTP Signature validation fails if server time is off by >5 minutes
- **Missing headers**: Ensure `Date`, `Digest`, and `Host` headers are present

---

### Solid Pod Integration

Solid (Social Linked Data) is a web decentralization project that allows users to store their data in personal online data stores called Pods.

#### Authentication (OIDC)

OdyFeed uses Solid-OIDC (OpenID Connect) for authentication.

**Flow**:
```
1. User enters their WebID (e.g., https://alice.solidcommunity.net/profile/card#me)
   ↓
2. Discover OIDC issuer from WebID
   - Fetch WebID document (Turtle/JSON-LD)
   - Extract solid:oidcIssuer predicate
   ↓
3. Initiate OAuth flow
   - Redirect to issuer with client_id (clientid.jsonld URL)
   - Request scopes: openid, webid, offline_access
   ↓
4. User authenticates at Solid provider
   ↓
5. Provider redirects back with authorization code
   - Callback: /api/auth/callback?code=...&state=...
   ↓
6. Exchange code for tokens
   - Access token, ID token, refresh token
   - DPoP (Demonstrating Proof-of-Possession) bound tokens
   ↓
7. Hydrate session on server
   - Store session in data/sessions/
   - Store Solid session (with DPoP keys) in data/solid-sessions/
   - Create authenticated fetch function
   ↓
8. Access user's Pod with authenticated fetch
```

**Implementation**: See `server/api/auth/` and `server/utils/solidSession.ts`

#### Permissions (ACL - Access Control Lists)

Each container in the user's Pod has specific permissions:

| Container | Permission Type | Public Read? | Public Write? | Public Append? |
|-----------|----------------|--------------|---------------|----------------|
| `/social/inbox/` | PublicAppendPrivateRead | ❌ No | ❌ No | ✅ Yes |
| `/social/outbox/` | PublicReadOwnerWrite | ✅ Yes | ❌ No | ❌ No |
| `/social/followers/` | PublicReadOwnerWrite | ✅ Yes | ❌ No | ❌ No |
| `/social/following/` | PublicReadOwnerWrite | ✅ Yes | ❌ No | ❌ No |
| `/profile/` | PublicReadOwnerWrite | ✅ Yes | ❌ No | ❌ No |
| `/settings/` | PrivateOwnerOnly | ❌ No | ❌ No | ❌ No |

**Why PublicAppendPrivateRead for Inbox?**
- Remote ActivityPub servers need to POST activities (append)
- Only the owner should read their inbox (privacy)
- Prevents inbox snooping by third parties

**ACL Example** (Turtle format):
```turtle
@prefix acl: <http://www.w3.org/ns/auth/acl#>.
@prefix foaf: <http://xmlns.com/foaf/0.1/>.

<#public>
  a acl:Authorization;
  acl:accessTo <./>;
  acl:default <./>;
  acl:agentClass foaf:Agent;
  acl:mode acl:Append.

<#owner>
  a acl:Authorization;
  acl:accessTo <./>;
  acl:default <./>;
  acl:agent <https://alice.solidcommunity.net/profile/card#me>;
  acl:mode acl:Read, acl:Write, acl:Control.
```

**Implementation**: See `server/utils/aclGenerator.ts`

#### Get/Post to Pods

**Library**: `@inrupt/solid-client` for LDP (Linked Data Platform) operations

**Writing Data** (Save Activity):
```typescript
import { saveFileInContainer } from '@inrupt/solid-client'
import { getAuthenticatedFetch } from '~/server/utils/solidSession'

const authenticatedFetch = await getAuthenticatedFetch(webId)
const activityBlob = new Blob([JSON.stringify(activity)], { 
  type: 'application/ld+json' 
})

const savedFile = await saveFileInContainer(
  containerUrl,
  activityBlob,
  { 
    slug: 'my-activity.json',
    fetch: authenticatedFetch 
  }
)
```

**Reading Data** (Fetch Activity):
```typescript
import { getFile } from '@inrupt/solid-client'

const file = await getFile(activityUrl, { fetch: authenticatedFetch })
const text = await file.text()
const activity = JSON.parse(text)
```

**Listing Container Contents** (Inbox/Outbox pagination):
```typescript
import { getSolidDataset, getContainedResourceUrlAll } from '@inrupt/solid-client'

const dataset = await getSolidDataset(containerUrl, { fetch: authenticatedFetch })
const urls = getContainedResourceUrlAll(dataset)
// Returns: ['https://pod.example/social/inbox/activity1.json', ...]
```

**Implementation**: See `server/utils/podStorage.ts`

#### clientid.jsonld

The `clientid.jsonld` file tells Solid providers how to configure OAuth for OdyFeed.

**Auto-Generated from `BASE_URL`**:
```json
{
  "@context": "https://www.w3.org/ns/solid/oidc-context.jsonld",
  "client_id": "https://odyfeed.example.com/clientid.jsonld",
  "client_name": "OdyFeed",
  "client_uri": "https://odyfeed.example.com",
  "logo_uri": "https://odyfeed.example.com/favicon.ico",
  "redirect_uris": ["https://odyfeed.example.com/api/auth/callback"],
  "scope": "openid webid offline_access",
  "grant_types": ["authorization_code", "refresh_token"],
  "response_types": ["code"],
  "token_endpoint_auth_method": "none"
}
```

**Served at**: `/clientid.jsonld`

**Why It's Important**:
- Solid providers fetch this document during OAuth flow
- `client_id` must be a publicly accessible URL
- `redirect_uris` must exactly match callback URL
- Changing `BASE_URL` requires regenerating this file (automatic on server start)

**Implementation**: See `server/routes/clientid.jsonld.ts`

---

### Webmentions

Webmentions are a W3C recommendation for notifications between websites. When someone links to your content, you receive a webmention.

#### How It Works

```
1. Site A publishes content with link to Site B
   <a href="https://odyfeed.example.com/post/123">Great post!</a>
   ↓
2. Site A sends webmention to Site B
   POST /api/webmentions
   Content-Type: application/x-www-form-urlencoded
   
   source=https://site-a.com/my-post
   &target=https://odyfeed.example.com/post/123
   ↓
3. Site B (OdyFeed) validates the webmention
   - Fetch source URL
   - Verify it contains a link to target
   - Parse microformats2 (h-entry)
   ↓
4. Store webmention
   - Add to post's webmentions collection
   - Include author info, content excerpt
   ↓
5. Display on target post
   - Show as comment/like/mention
```

#### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/webmentions` | POST | Receive webmention |
| `/api/webmentions/site` | GET | List all site webmentions |
| `/api/webmentions/posts/:username/:id` | GET | List webmentions for specific post |

**Advertise Webmention Endpoint**:
```html
<!-- In <head> -->
<link rel="webmention" href="https://odyfeed.example.com/api/webmentions">
```

**Implementation**: See `server/api/webmentions/index.post.ts`

#### Microformats2 Parsing

OdyFeed parses microformats2 markup to extract metadata from source pages:

**h-entry** (Blog post/article):
```html
<article class="h-entry">
  <h1 class="p-name">Article Title</h1>
  <p class="p-summary">Short description</p>
  <div class="e-content">Full article content...</div>
  <a href="https://odyfeed.example.com/post/123" class="u-in-reply-to">Reply</a>
  <a href="https://author.com" class="p-author h-card">
    <img src="avatar.jpg" class="u-photo" alt="">
    <span class="p-name">Author Name</span>
  </a>
  <time class="dt-published" datetime="2026-01-20">Jan 20, 2026</time>
</article>
```

**Webmention Type Detection**:
- `u-like-of` → Like
- `u-repost-of` → Repost/Share
- `u-in-reply-to` → Comment/Reply
- Default → Mention

**Implementation**: See `server/utils/microformats.ts`

---

### Linked Data (RDF)

OdyFeed uses RDF (Resource Description Framework) to represent structured data about mythological actors, events, and posts.

#### Events / Actors / Vocabulary

**Actors** (`public/actors.ttl`):
```turtle
@prefix myth: <https://odyfeed.example.com/vocab#> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .

<actors/odysseus>
    a myth:Actor ;
    foaf:name "Odysseus" ;
    myth:tone "slim, berekend, volhardend" ;
    myth:avatar "https://api.dicebear.com/7.x/avataaars/svg?seed=odysseus" .

<actors/poseidon>
    a myth:Actor ;
    foaf:name "Poseidon" ;
    myth:tone "wraakzuchtig, almachtig" ;
    myth:avatar "https://api.dicebear.com/7.x/avataaars/svg?seed=poseidon" .
```

**Events** (`public/events.ttl`):
```turtle
@prefix myth: <https://odyfeed.example.com/vocab#> .
@prefix dct: <http://purl.org/dc/terms/> .

<events/01-trojan-horse>
    a myth:Event ;
    dct:title "De list van het paard" ;
    myth:sequence 1 ;
    myth:location "Troje" ;
    myth:description "Met een houten paard mislukt Troje definitief." ;
    myth:involvesActor <actors/odysseus>, <actors/athena> .

<events/02-cyclops-cave>
    a myth:Event ;
    dct:title "In de grot van de Cyclopen" ;
    myth:sequence 2 ;
    myth:location "Eiland van de Cyclopen" ;
    myth:description "Polyphemus, de eenogige reus, verslindt enkele mannen..." ;
    myth:involvesActor <actors/odysseus>, <actors/poseidon> .
```

**Vocabulary** (`public/vocab.ttl`):
```turtle
@prefix myth: <https://odyfeed.example.com/vocab#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

myth:Actor
    a rdfs:Class ;
    rdfs:comment "An actor in the mythological world." .

myth:Event
    a rdfs:Class ;
    rdfs:comment "A mythological event." .

myth:tone
    a rdfs:Property ;
    rdfs:label "tone" ;
    rdfs:comment "The personality tone of an actor." .

myth:sequence
    a rdfs:Property ;
    rdfs:label "sequence" ;
    rdfs:comment "The sequence number of an event." .
```

**Access**:
- `/actors` → Serves `actors.ttl`
- `/events` → Serves `events.ttl`
- `/vocab` → Serves `vocab.ttl`

#### Data Generation

**Post Generation with OpenAI**:

When a user registers and matches a mythological actor (e.g., username "odysseus" → Odysseus), OdyFeed generates 3 sample posts using OpenAI:

```typescript
// server/utils/postGenerator.ts

const prompt = `
You are ${actor.name}, the Greek god/hero.
Your personality: ${actor.tone}

Write a social media post about this event:
Event: ${event.title}
Description: ${event.description}

Requirements:
- Write in first person
- Match the character's tone
- Keep it under 280 characters
- Be engaging and dramatic
`

const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: prompt }],
  max_tokens: 150
})

const postContent = response.choices[0].message.content
```

Posts are stored as:
1. **ActivityPub Note** in local storage (`data/posts/{username}/{id}.jsonld`)
2. **Activity in User's Pod** (`/social/outbox/{activityId}.json`)

**Timeline Aggregation**:

The timeline groups posts by narrative events:

```typescript
// server/api/timeline.get.ts

const events = parseEvents() // From events.ttl
const actors = parseActors() // From actors.ttl
const posts = await fetchAllUserPosts() // From Solid Pods

const groupedByEvent = events.map(event => ({
  event,
  posts: posts.filter(post => post.aboutEvent === event.id)
}))

return { groupedByEvent, mythActors: actors }
```

**Implementation**: See `server/utils/postGenerator.ts` and `server/utils/rdf.ts`

---

## Common Pitfalls & Troubleshooting

### 1. "accountId mismatch" Error During OAuth Callback

**Symptom**: OAuth callback fails with cryptic error about DPoP key mismatch.

**Cause**: The `Session` object used in callback doesn't have the same DPoP keys as the one used in login.

**Fix**: Ensure `pendingSessions` map is correctly tracking session instances.

**Verification**:
```powershell
# Check server logs for:
# "✅ Recovered pending session from memory"
# "DPoP key in storage: ✅ FOUND"
```

**Prevention**: Don't restart the dev server between login and callback. If you must, implement disk-based pending session recovery.

---

### 2. HTTP Signature Verification Fails

**Symptom**: Remote servers reject your federated activities with 401/403.

**Common Causes**:
1. **Clock skew**: Your server's clock is >5 minutes off
2. **Wrong key format**: Private key not PEM-encoded PKCS#8
3. **Body mismatch**: `Digest` header doesn't match request body

**Debug Steps**:
```powershell
# 1. Check server time
Get-Date

# 2. Check logs (logs/activitypub.log)
Get-Content logs/activitypub.log -Tail 50

# 3. Test signature locally
curl -X POST http://localhost:3000/api/actors/testuser/inbox `
  -H "Content-Type: application/ld+json" `
  -d '{"type":"Follow","actor":"http://localhost:3000/api/actors/sender"}'
```

**Fix**:
- Sync server clock: `w32tm /resync` (Windows)
- Verify key format in Pod: `/settings/keys.json`
- Check `Digest` calculation in `server/utils/crypto.ts`

---

### 3. Pod Access Fails (401 Unauthorized)

**Symptom**: Server can't read/write to user's Pod.

**Causes**:
1. **Token expired**: Refresh token invalid or revoked
2. **Wrong WebID**: Session mapped to incorrect Pod
3. **ACL misconfiguration**: Container ACLs too restrictive

**Debug**:
```typescript
// Add to server/utils/podStorage.ts
const authenticatedFetch = await getAuthenticatedFetch(webId)
if (!authenticatedFetch) {
  console.error('❌ No authenticated fetch for', webId)
}
```

**Fix - Re-authenticate**:
1. User logs out
2. Delete session from `data/sessions/`
3. User logs in again
4. System re-registers user with fresh tokens

---

### 4. "Username Already Registered" Error

**Symptom**: Registration fails even though user hasn't registered before.

**Cause**: WebID already mapped to a username in `data/users/webid-mappings.json`.

**Check Mapping**:
```powershell
Get-Content data/users/webid-mappings.json | ConvertFrom-Json
```

**Fix - Reset Registration**:
```powershell
# Backup first
Copy-Item data/users/webid-mappings.json data/users/webid-mappings.json.bak

# Edit JSON to remove the WebID entry
notepad data/users/webid-mappings.json

# Or completely reset (CAUTION: deletes all user mappings)
Remove-Item data/users/webid-mappings.json
```

---

### 5. CORS Errors with Solid Provider

**Symptom**: Login fails with CORS error in browser console.

**Cause**: Some Solid providers have strict CORS policies.

**Workaround**:
- Use `solidcommunity.net` (most permissive)
- Ensure `BASE_URL` matches your deployment domain exactly
- Check `nuxt.config.ts` → `vite.server.allowedHosts` includes your domain

---

### 6. Federation Not Working (Activities Not Delivered)

**Checklist**:
- [ ] `BASE_URL` uses HTTPS (or federating with localhost servers)
- [ ] Actor profile is publicly accessible (test with `curl`)
- [ ] Private key exists in Pod (`/settings/keys.json`)
- [ ] HTTP Signature includes all required headers
- [ ] Recipient's inbox is correct (check remote actor profile)
- [ ] Remote server isn't blocking your domain

**Test Federation Manually**:
```powershell
# Fetch your actor profile
curl https://your-domain.com/api/actors/yourname `
  -H "Accept: application/ld+json"

# Should return JSON with "publicKey" field
```

---

### 7. Timeline Shows No Posts

**Causes**:
1. **No users registered**: Timeline aggregates posts from all registered users
2. **Pod access failed**: Server can't read outbox containers
3. **No posts created**: Users haven't posted yet

**Quick Fix - Verify Timeline Endpoint**:
```powershell
curl http://localhost:3000/api/timeline
```

Expected response: Array of `groupedByEvent` objects with posts.

---

### 8. TypeScript Errors After Update

**Symptom**: IDE shows red squiggles, build fails with type errors.

**Fix**:
```powershell
# 1. Clear Nuxt cache
Remove-Item -Recurse -Force .nuxt

# 2. Clear node_modules cache
Remove-Item -Recurse -Force node_modules/.cache

# 3. Reinstall (if needed)
Remove-Item -Recurse -Force node_modules
pnpm install

# 4. Rebuild Nuxt
pnpm dev
```

---

### 9. Webmentions Not Appearing

**Causes**:
1. **Source page doesn't link to target**: Webmention validation fails
2. **Microformat parsing error**: No h-entry found on source page
3. **Storage path incorrect**: Post not found in `data/posts/`

**Debug**:
```powershell
# Test webmention endpoint
curl -X POST http://localhost:3000/api/webmentions `
  -H "Content-Type: application/x-www-form-urlencoded" `
  -d "source=https://example.com/post&target=http://localhost:3000/post/123"

# Check logs
Get-Content logs/activitypub.log -Tail 20
```

---

### 10. OpenAI Posts Not Generating

**Symptom**: New users don't get sample posts during registration.

**Cause**: `OPENAI_API_KEY` not set or invalid.

**Check**:
```powershell
$env:OPENAI_API_KEY
```

**Fix**:
1. Get API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add to `.env`: `OPENAI_API_KEY=sk-...`
3. Restart server

**Fallback**: If no API key, posts use generic content (see `server/utils/postGenerator.ts`)

---

## Testing & Verification

### Manual Testing Checklist

#### Authentication
- [ ] Login with Solid Pod redirects to provider
- [ ] OAuth callback returns to app successfully
- [ ] Session persists across page reloads
- [ ] Logout clears session

#### Registration
- [ ] Username validation works (lowercase, no spaces)
- [ ] Pod containers created during registration
- [ ] ActivityPub profile saved to Pod
- [ ] Sample posts generated (if OpenAI configured)

#### Solid Pod Integration
- [ ] Pod containers created during registration
- [ ] Activities saved as JSON files in Pod
- [ ] ACLs set correctly (inbox is append-only, outbox is readable)
- [ ] Private key stored in `/settings/keys.json`

#### ActivityPub Federation
- [ ] Actor profile accessible at `/api/actors/:username`
- [ ] WebFinger works for `@username@domain`
- [ ] Outbox serves paginated activities
- [ ] HTTP Signatures valid on sent activities
- [ ] Remote activities received in inbox

#### Webmentions
- [ ] Endpoint advertised in `<link rel="webmention">`
- [ ] Receives webmentions via POST
- [ ] Validates source links to target
- [ ] Parses microformats2 correctly
- [ ] Displays on post pages

#### UI/UX
- [ ] Timeline loads and groups by events
- [ ] Posts display with actor info
- [ ] Like button works (optimistic update)
- [ ] Reply modal opens and submits
- [ ] Dark mode toggle works
- [ ] Responsive on mobile

### Automated Testing

**Unit Tests** (example, not currently implemented):
```typescript
// tests/unit/crypto.test.ts
import { generateActorKeyPair, signRequest } from '@/server/utils/crypto'

describe('Crypto Utils', () => {
  test('generates valid RSA key pair', () => {
    const { publicKey, privateKey } = generateActorKeyPair()
    expect(publicKey).toContain('BEGIN PUBLIC KEY')
    expect(privateKey).toContain('BEGIN PRIVATE KEY')
  })

  test('signs request correctly', () => {
    const { privateKey } = generateActorKeyPair()
    const headers = signRequest({
      privateKey,
      keyId: 'https://example.com/actor#key',
      url: 'https://remote.com/inbox',
      method: 'POST',
      body: '{"type":"Follow"}'
    })
    expect(headers.Signature).toBeDefined()
    expect(headers.Digest).toContain('SHA-256=')
  })
})
```

**Integration Tests** (example):
```typescript
// tests/integration/activitypub.test.ts
describe('ActivityPub Endpoints', () => {
  test('GET /api/actors/:username returns Actor object', async () => {
    const response = await fetch('http://localhost:3000/api/actors/testuser')
    const actor = await response.json()
    expect(actor.type).toBe('Person')
    expect(actor.inbox).toBeDefined()
  })

  test('POST to inbox with valid signature succeeds', async () => {
    // ... implementation
  })
})
```

---

## Deployment Considerations

### Production Checklist

- [ ] **HTTPS Required**: ActivityPub federation requires HTTPS (Mastodon won't federate with HTTP)
- [ ] **BASE_URL**: Set to your production domain (e.g., `https://odyfeed.example.com`)
- [ ] **Sessions**: Persist sessions to database (currently filesystem-based)
- [ ] **Rate Limiting**: Add rate limiting to API endpoints
- [ ] **Monitoring**: Set up logging aggregation (e.g., LogDNA, Papertrail)
- [ ] **Backups**: Regular backups of `data/` directory
- [ ] **Scaling**: Consider Redis for session storage if scaling horizontally

### Environment-Specific Config

**Development**:
```bash
BASE_URL=http://localhost:3000
OPENAI_API_KEY=sk-dev-key
```

**Production**:
```bash
BASE_URL=https://odyfeed.example.com
OPENAI_API_KEY=sk-prod-key
ACTIVITYPUB_PAGE_SIZE=50
```

### Hosting Recommendations

- **Vercel**: Works well for Nuxt apps (set `ssr: false`)
- **Netlify**: Similar to Vercel
- **Self-Hosted VPS**: Full control, install Node.js + Nginx
- **Docker**: Containerize for consistent deployments

**Docker Example** (not included, but recommended):
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
CMD ["node", ".output/server/index.mjs"]
```

---

## Contributing

Contributions are welcome! This project is primarily educational, but improvements are encouraged.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Code Style

- Follow the coding instructions in `global-copilot-instructions`
- Use TypeScript for all new code
- Write self-documenting code (avoid unnecessary comments)
- Use function expressions: `const myFunc = function () {}`
- Test locally before submitting PR

### Areas for Improvement

- [ ] Add automated tests (unit + integration)
- [ ] Implement database for sessions (replace filesystem)
- [ ] Add rate limiting middleware
- [ ] Improve error handling and user feedback
- [ ] Add admin dashboard for managing users
- [ ] Support for more ActivityPub activities (Block, Remove, Update)
- [ ] Better mobile responsiveness
- [ ] Accessibility improvements (ARIA labels, keyboard navigation)
- [ ] Performance optimizations (lazy loading, code splitting)
- [ ] Add more mythological actors and events

---

## Resources & Further Reading

### Official Specifications

- **[ActivityPub W3C Recommendation](https://www.w3.org/TR/activitypub/)**: The official specification
- **[ActivityStreams 2.0](https://www.w3.org/TR/activitystreams-core/)**: Vocabulary for social data
- **[Solid Protocol](https://solidproject.org/TR/protocol)**: Specification for decentralized data storage
- **[HTTP Signatures (draft-cavage-http-signatures-12)](https://datatracker.ietf.org/doc/html/draft-cavage-http-signatures-12)**: Authentication for HTTP requests
- **[Webmention W3C Recommendation](https://www.w3.org/TR/webmention/)**: Decentralized notifications

### Implementation Guides

- **[Mastodon ActivityPub Guide](https://docs.joinmastodon.org/spec/activitypub/)**: Practical guide with Mastodon-specific extensions
- **[Solid Developer Resources](https://solidproject.org/developers)**: Getting started with Solid development
- **[Inrupt JavaScript Client Libraries](https://docs.inrupt.com/developer-tools/javascript/client-libraries/)**: Official Solid client library docs
- **[ActivityPub Rocks!](https://activitypub.rocks/)**: Test suite and validator

### Community & Tools

- **[Fediverse Developer Network](https://fediverse.party/en/developers)**: Resources for building federated apps
- **[SocialHub](https://socialhub.activitypub.rocks/)**: ActivityPub community forum
- **[Solid Forum](https://forum.solidproject.org/)**: Community support for Solid development
- **[WebMention.io](https://webmention.io/)**: Hosted webmention service (alternative approach)

### Interesting Projects

- **[Mastodon](https://github.com/mastodon/mastodon)**: Ruby-based fediverse platform
- **[Pleroma](https://pleroma.social/)**: Lightweight fediverse server
- **[PeerTube](https://joinpeertube.org/)**: Federated video platform (ActivityPub)
- **[Pixelfed](https://pixelfed.org/)**: Federated photo sharing (ActivityPub)
- **[Inrupt PodSpaces](https://signup.pod.inrupt.com/)**: Commercial Solid Pod provider

### Learning Resources

- **[How to implement ActivityPub in your project](https://blog.joinmastodon.org/2018/06/how-to-implement-a-basic-activitypub-server/)**: Mastodon blog post
- **[Understanding Solid Pods](https://solidproject.org/faqs)**: FAQ and beginner guides
- **[RDF Primer](https://www.w3.org/TR/rdf11-primer/)**: Introduction to RDF concepts
- **[Microformats2 Spec](https://microformats.org/wiki/microformats2)**: Parsing semantic HTML

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

## Acknowledgments

- **Homer**: For the original Odyssey (circa 8th century BCE)
- **Tim Berners-Lee**: For inventing the Web and championing Solid
- **W3C Social Web Working Group**: For ActivityPub and related standards
- **Inrupt**: For Solid client libraries and developer tools
- **Mastodon Community**: For federation best practices and interoperability
- **OpenAI**: For GPT models used in post generation

---

## Contact & Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/OdyFeed/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/OdyFeed/discussions)
- **Author**: Your Name ([@yourhandle@mastodon.social](https://mastodon.social/@yourhandle))

---

**Built with ❤️ and a passion for the decentralized web**

*"Tell me, Muse, of the man of many ways, who was driven far journeys..."* — Homer, The Odyssey
