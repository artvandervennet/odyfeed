# OdyFeed

A Nuxt-based ActivityPub/Solid-compatible social feed application with ActivityPods authentication.

## Features

- 🔐 **ActivityPods Authentication** - Native OIDC with PKCE flow
- 🌐 **ActivityStreams Support** - Full ActivityPub compatibility
- 📦 **Solid Pod Integration** - Read/write to Solid pods
- 🔄 **Token Refresh** - Automatic session management
- 🎨 **Modern UI** - Built with Nuxt UI and Tailwind CSS

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and set your base URL:

```env
BASE_URL=http://localhost:3000
```

**Note:** The `clientid.json` is automatically generated from `BASE_URL` - no manual editing needed!

### 3. Start Development Server

```bash
pnpm dev
```

Visit `http://localhost:3000` to see the app.

## Authentication

This app uses ActivityPods-compatible OIDC authentication with full LDP data provider support.

📖 **[See ACTIVITYPODS_INTEGRATION.md](./ACTIVITYPODS_INTEGRATION.md)** for complete integration documentation.

📖 **[See TESTING_GUIDE.md](./TESTING_GUIDE.md)** for step-by-step testing instructions.

📖 **[See ACTIVITYPODS_AUTH.md](./ACTIVITYPODS_AUTH.md)** for authentication flow details.

### Supported Providers

- ✅ **VanderVennet ActivityPods** (`https://vandervennet.art`) - Primary provider
- ✅ **ActivityPods** (`https://mypod.store`) - Public instance with full support
- ⚠️ **Generic Solid Pods** - Limited support (no ActivityStreams inbox/outbox)

### Troubleshooting ngrok + Solid Providers

⚠️ **Important**: If using ngrok free tier for development:

- ✅ **Inrupt PodSpaces** works with ngrok (default in UI)
- ❌ **SolidCommunity.net** does NOT work with ngrok free tier

See **[SOLUTION_NGROK_500_ERROR.md](./SOLUTION_NGROK_500_ERROR.md)** for complete details and solutions.

**Quick Fix**: Use Inrupt PodSpaces (`https://login.inrupt.com`) for development with ngrok.

## Production

Build the application for production:

```bash
pnpm build
```

**📦 Easy Deployment:**

See **[EASY_DEPLOY.md](./EASY_DEPLOY.md)** for the simplified deployment guide.

**TL;DR:** Just set `BASE_URL=https://your-domain.com` as an environment variable and deploy!

The `clientid.json` is automatically generated from your `BASE_URL` - no manual configuration needed.

For detailed checklist: **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)**

Preview production build locally:

```bash
pnpm preview
```

## Project Structure

```
OdyFeed/
├── app/
│   ├── composables/
│   │   ├── useActivityPodsAuth.ts   # ActivityPods OIDC authentication
│   │   └── useActivityPub.ts        # ActivityPub utilities
│   ├── stores/
│   │   └── authStore.ts             # Authentication state management
│   ├── types/
│   │   └── oidc.ts                  # OIDC TypeScript types
│   ├── utils/
│   │   └── oidc.ts                  # PKCE & JWT utilities
│   ├── pages/
│   │   ├── callback.vue             # OAuth callback handler
│   │   └── index.vue                # Main feed page
│   └── components/
│       └── LoginModal.vue           # Authentication UI
├── public/
│   └── clientid.json                # OIDC client registration
└── shared/
    └── types/
        └── activitypub.ts           # ActivityPub types
```

## Technologies

- **Nuxt 4** - Vue.js framework
- **Pinia** - State management
- **Pinia Colada** - Data fetching and caching
- **Nuxt UI** - Component library
- **Tailwind CSS 4** - Styling
- **TypeScript** - Type safety

## Documentation

- [ActivityPods Authentication](./ACTIVITYPODS_AUTH.md) - Detailed auth documentation
- [Nuxt Documentation](https://nuxt.com/docs)
- [ActivityPods](https://activitypods.org/)

## License

MIT
