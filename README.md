# CloudBeats

A cloud music manager that streams your music collection from Google Drive, Dropbox, and OneDrive — all in one place.

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

## Project Structure

```
cloudbeats/
├── DESIGN.md                              # Design tokens + prose (single source of truth)
├── .env.example                           # Environment variable template
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── tsconfig.json
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
│   │   │   └── settings/page.tsx          # Account management
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts    # NextAuth config + providers
│   │       ├── scan/route.ts                  # Scan cloud → upsert tracks to DB
│   │       └── stream/[provider]/route.ts     # Audio proxy with Range support
│   │
│   ├── components/
│   │   ├── player/PlayerBar.tsx           # Bottom-fixed player controls
│   │   ├── library/VirtualTrackList.tsx   # Virtualized list (overscan scroll)
│   │   ├── cloud/CloudAccountCard.tsx     # Cloud account status card
│   │   └── layout/Sidebar.tsx             # Navigation + playlists sidebar
│   │
│   ├── lib/
│   │   ├── cloud-adapters/                # Cloud provider abstraction
│   │   │   ├── index.ts                   # Interface + getAdapter() factory
│   │   │   ├── google.ts                  # Google Drive API v3
│   │   │   ├── dropbox.ts                 # Dropbox API v2
│   │   │   └── onedrive.ts               # Microsoft Graph API v1.0
│   │   ├── cache/image-cache.ts           # LRU cache (2000 entries, 1h TTL)
│   │   └── metadata/                      # ID3 tag extraction
│   │       ├── index.ts                   # Worker pool manager
│   │       └── metadata-worker.ts         # Worker: music-metadata-browser
│   │
│   ├── stores/player-store.ts             # Zustand: play/pause/seek/queue/repeat/shuffle
│   ├── db/
│   │   ├── index.ts                       # Drizzle + better-sqlite3 (WAL mode)
│   │   └── schema/index.ts               # Tables: accounts, tracks, playlists, scan_log
│   ├── types/index.ts                     # All TypeScript types + constants
│   └── styles/globals.css                 # Tailwind v4 @theme (from DESIGN.md tokens)
│
└── data/                                  # SQLite database (runtime, gitignored)
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in your credentials in `.env.local` (see [API Key Setup](#api-key-setup) below).

### 3. Run the dev server

```bash
npx next dev
```

Open [http://localhost:3000](http://localhost:3000).

## API Key Setup

### Google Drive

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. **Create a project** → name it `CloudBeats`
3. **Enable APIs** → APIs & Services → Library → search **Google Drive API** → Enable
4. **Configure OAuth consent screen:**
   - User Type: **External**
   - App name: `CloudBeats`
   - Add scope: `.../auth/drive.readonly`
   - Add your Gmail as test user
5. **Create credentials:**
   - APIs & Services → Credentials → **+ CREATE CREDENTIALS** → OAuth client ID
   - Application type: **Web application**
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
6. Copy **Client ID** → `GOOGLE_CLIENT_ID`, **Client Secret** → `GOOGLE_CLIENT_SECRET`

### Dropbox

1. Go to [Dropbox App Console](https://www.dropbox.com/developers/apps)
2. **Create app** → Scoped access → Full Dropbox
3. **Permissions** tab → enable `files.content.read`, `files.metadata.read`
4. **Settings** tab → Redirect URI: `http://localhost:3000/api/auth/callback/dropbox`
5. Copy **App key** → `DROPBOX_CLIENT_ID`, **App secret** → `DROPBOX_CLIENT_SECRET`

### OneDrive

1. Go to [Azure Portal](https://portal.azure.com) → **App registrations** → **New registration**
2. Name: `CloudBeats`, Account type: **Any organizational directory and personal Microsoft accounts**
3. Redirect URI: Web → `http://localhost:3000/api/auth/callback/azure-ad`
4. **Certificates & secrets** → New client secret → copy the **Value**
5. **API permissions** → Add permission → Microsoft Graph → Delegated → `Files.Read.All`, `offline_access`
6. Copy **Application (client) ID** → `ONEDRIVE_CLIENT_ID`, Secret → `ONEDRIVE_CLIENT_SECRET`

### NextAuth Secret

Generate a random secret:

```bash
openssl rand -base64 32
```

Paste the result into `NEXTAUTH_SECRET` in `.env.local`.

## Design System

CloudBeats uses [DESIGN.md](./DESIGN.md) as the single source of truth for all design tokens (colors, typography, spacing, border radius, components).

Export tokens to Tailwind v4 CSS:

```bash
npx @google/design.md export --format css-tailwind DESIGN.md > src/styles/theme.css
```

The `@theme` block in `globals.css` is derived from these tokens. Any change in `DESIGN.md` is reflected in the UI after re-export.

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
                 │  Next.js API│         │ /api/stream │
                 │  Routes     │         │  (proxy)    │
                 └──────┬──────┘         └──────┬──────┘
                        │                      │
                 ┌──────▼──────┐         ┌──────▼──────┐
                 │   SQLite     │         │  Cloud APIs │
                 │  (Drizzle)  │         │ (adapters)  │
                 └─────────────┘         └─────────────┘
```

**Streaming flow:** `<audio>` → `/api/stream/{provider}?fileId=X` → Server proxy (Range headers) → Cloud API → Browser. This solves CORS and hides access tokens.

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

## License

MIT
