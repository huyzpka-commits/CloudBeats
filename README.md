# CloudBeats

A cloud music manager that streams your music collection from Google Drive, Dropbox, and OneDrive — all in one place.

**Live Demo:** https://cloudbeats-production.up.railway.app

## Features

- **Multi-cloud streaming** — Connect Google Drive, Dropbox, and OneDrive simultaneously
- **Audio streaming proxy** — Server-side proxy with Range request support for seeking
- **Virtual track list** — Handles 50,000+ tracks by only rendering the visible viewport
- **Design system** — `DESIGN.md` as single source of truth, auto-exported to Tailwind v4 `@theme`
- **Offline metadata** — Track info stored locally in SQLite via Drizzle ORM
- **ID3 extraction** — Web Worker pool parses metadata without blocking the UI
- **LRU image cache** — Album art cached with eviction policy for memory efficiency
- **OAuth 2.0** — NextAuth.js with automatic token refresh
- **Dark UI** — "Neon Abyss" glassmorphism theme

## Tech Stack

| Layer | Technology |
|:------|:-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + `@theme` from DESIGN.md |
| State | Zustand |
| Database | SQLite (better-sqlite3) via Drizzle ORM |
| Auth | NextAuth.js v4 (Google, Dropbox, Azure AD) |
| Metadata | music-metadata-browser (Web Worker pool) |
| Audio | Native `<audio>` element with proxy streaming |
| Deploy | Railway (Docker) |

## Project Structure

```
cloudbeats/
├── DESIGN.md                              # Design tokens + prose (single source of truth)
├── .env.example                           # Environment variable template
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── tsconfig.json
├── drizzle.config.ts                      # Drizzle ORM config
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                     # Root layout (dark theme)
│   │   ├── page.tsx                       # → redirects to /library
│   │   ├── (auth)/login/page.tsx          # OAuth login page
│   │   ├── (main)/
│   │   │   ├── layout.tsx                 # Sidebar + Player bar shell
│   │   │   ├── library/page.tsx           # Virtual track list + cloud cards
│   │   │   ├── search/page.tsx            # Cross-cloud search
│   │   │   └── settings/page.tsx          # Account management + disconnect
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts    # NextAuth config + OAuth persistence
│   │       ├── accounts/route.ts              # GET all connected accounts
│   │       ├── accounts/[id]/route.ts         # DELETE account (cascade)
│   │       ├── tracks/route.ts                # GET all indexed tracks
│   │       ├── scan/route.ts                  # Scan cloud → upsert tracks to DB
│   │       ├── stream/[provider]/route.ts     # Audio proxy with Range support
│   │       └── health/route.ts                # Health check endpoint
│   │
│   ├── components/
│   │   ├── player/PlayerBar.tsx           # Bottom-fixed player controls
│   │   ├── library/VirtualTrackList.tsx   # Virtualized list (overscan scroll)
│   │   ├── cloud/CloudAccountCard.tsx     # Cloud account status + scan button
│   │   └── layout/Sidebar.tsx             # Navigation + playlists sidebar
│   │
│   ├── lib/
│   │   ├── cloud-adapters/                # Cloud provider abstraction
│   │   │   ├── index.ts                   # Interface + getAdapter() factory
│   │   │   ├── google.ts                  # Google Drive API v3 + Bearer auth
│   │   │   ├── dropbox.ts                 # Dropbox API v2
│   │   │   └── onedrive.ts                # Microsoft Graph API v1.0
│   │   ├── cache/image-cache.ts           # LRU cache (2000 entries, 1h TTL)
│   │   └── metadata/                      # ID3 tag extraction
│   │       ├── index.ts                   # Worker pool manager
│   │       └── metadata-worker.ts         # Worker: music-metadata-browser
│   │
│   ├── stores/player-store.ts             # Zustand: play/pause/seek/queue/repeat/shuffle
│   ├── db/
│   │   ├── index.ts                       # Drizzle + better-sqlite3 (WAL mode)
│   │   ├── migrations.ts                  # Auto-create schema on first connect
│   │   └── schema/index.ts                # Tables: accounts, tracks, playlists, scan_log
│   ├── types/
│   │   ├── index.ts                       # All TypeScript types + constants
│   │   └── next-auth.d.ts                 # Session/JWT type augmentation
│   └── styles/globals.css                 # Tailwind v4 @theme (from DESIGN.md tokens)
│
└── data/                                  # SQLite database (runtime, gitignored)
```

## Quick Start

### Local Development

```bash
# 1. Clone
npm install

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local with your API keys (see below)

# 3. Run dev server
npx next dev
# Open http://localhost:3000
```

### Deploy to Railway (Free Tier)

```bash
# 1. Push to GitHub (already done)
git push origin main

# 2. Railway Dashboard
# - New Project → Deploy from GitHub repo
# - Railway auto-detects Next.js + builds

# 3. Add Environment Variables
# Dashboard → Variables → add all keys from .env.example
# NEXTAUTH_URL=https://your-app.up.railway.app

# 4. Update OAuth Redirect URIs in all providers
# https://your-app.up.railway.app/api/auth/callback/google
# https://your-app.up.railway.app/api/auth/callback/dropbox
# https://your-app.up.railway.app/api/auth/callback/azure-ad
```

## API Key Setup

### Google Drive

1. [Google Cloud Console](https://console.cloud.google.com) → New Project "CloudBeats"
2. Enable **Google Drive API**
3. OAuth consent screen → External → scope `.../auth/drive.readonly`
4. Credentials → OAuth client ID → Web application
   - Redirect URI: `https://your-app.up.railway.app/api/auth/callback/google`
5. Copy **Client ID** → `GOOGLE_CLIENT_ID`, **Client Secret** → `GOOGLE_CLIENT_SECRET`

### Dropbox

1. [Dropbox App Console](https://www.dropbox.com/developers/apps) → Create app
   - Scoped access → Full Dropbox
2. Permissions: `files.content.read`, `files.metadata.read`
3. Redirect URI: `https://your-app.up.railway.app/api/auth/callback/dropbox`
4. Copy **App key** → `DROPBOX_CLIENT_ID`, **App secret** → `DROPBOX_CLIENT_SECRET`

### OneDrive (Azure AD)

1. [Azure Portal](https://portal.azure.com) → App registrations → New
   - Name: `CloudBeats`, Account type: Personal + Org accounts
2. Redirect URI: `https://your-app.up.railway.app/api/auth/callback/azure-ad`
3. Certificates & secrets → New client secret → copy **Value**
4. API permissions → Microsoft Graph → Delegated → `Files.Read.All`, `offline_access`
5. Copy **Application ID** → `ONEDRIVE_CLIENT_ID`, Secret → `ONEDRIVE_CLIENT_SECRET`

### NextAuth Secret

```bash
openssl rand -base64 32
```
Paste result into `NEXTAUTH_SECRET`.

## Usage

1. **Connect Cloud Drive** → `/login` → Sign in with Google Drive / Dropbox / OneDrive
2. **Scan Music** → `/library` → Click **Scan** (circular arrows) on connected drive card
3. **Play** → Click any track in the virtual list → Player bar controls playback
4. **Disconnect** → `/settings` → Click **Disconnect** to remove account (cascade deletes tracks)

## Design System

CloudBeats uses [DESIGN.md](./DESIGN.md) as the single source of truth for all design tokens.

Export to Tailwind v4:
```bash
npx @google/design.md export --format css-tailwind DESIGN.md > src/styles/theme.css
```

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                     BROWSER                          │
│  ┌───────────┐  ┌───────────────┐  ┌──────────────┐ │
│  │  Sidebar   │  │ Virtual List  │  │  Player Bar  │ │
│  │  (260px)   │  │ (overscan)    │  │  (96px)      │ │
│  └───────────┘  └───────────────┘  └──────┬───────┘ │
│                       │                      │       │
│                 Zustand Store          <audio> elem  │
└───────────────────────┼──────────────────────┼───────┘
                        │                      │
                 ┌──────▼──────┐         ┌──────▼──────┐
│                 │  Next.js API│         │ /api/stream │
│                 │  Routes     │         │  (proxy)    │
│                 └──────┬──────┘         └──────┬──────┘
                        │                      │
                 ┌──────▼──────┐         ┌──────▼──────┐
│                 │   SQLite     │         │  Cloud APIs │
│                 │  (Drizzle)  │         │ (adapters)  │
│                 └─────────────┘         └─────────────┘
```

**Streaming flow:** `<audio>` → `/api/stream/{provider}?fileId=X&accountId=Y` → Server proxy (Bearer headers, Range requests) → Cloud API → Browser. Solves CORS, hides tokens.

## Performance Optimizations

| Problem | Solution |
|:--------|:---------|
| 50,000+ tracks in DOM | Virtual list — only renders ~15-20 rows in viewport |
| Album art memory | LRU cache (2,000 entries, 1h TTL, auto-evict) |
| Album art bandwidth | `srcset` with 48w/96w/192w/384w + `loading="lazy"` |
| ID3 parsing blocks UI | Web Worker pool (`hardwareConcurrency` workers) |
| DB write throughput | Batch upsert (50/batch) + WAL mode + 64MB page cache |
| Audio seeking | Range request proxy (206 Partial Content) |
| Token expiration | Auto-refresh before API calls, transparent to user |

## Limitations

- **Railway Free Tier**: SQLite stored in `/tmp` → data lost on redeploy. Use Hobby plan ($5/mo) + persistent volume for production.
- **No persistent queue**: Queue state resets on refresh (can be enhanced with localStorage).
- **Metadata**: Requires Web Audio API support for ID3 parsing in browser.

## License

MIT
