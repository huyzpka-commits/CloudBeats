---
name: CloudBeats
colors:
  surface: "#0f0f14"
  surface-dim: "#0a0a0e"
  surface-bright: "#1e1e28"
  surface-container-lowest: "#050508"
  surface-container-low: "#121218"
  surface-container: "#16161e"
  surface-container-high: "#1f1f2a"
  surface-container-highest: "#2a2a38"
  on-surface: "#e8e6f0"
  on-surface-variant: "#9b99b0"
  primary: "#7c6aff"
  on-primary: "#ffffff"
  primary-container: "#9b8aff"
  on-primary-container: "#1a1040"
  secondary: "#6cd4c8"
  on-secondary: "#003330"
  secondary-container: "#004f4a"
  on-secondary-container: "#8af0e4"
  tertiary: "#f07070"
  on-tertiary: "#ffffff"
  error: "#f07070"
  on-error: "#ffffff"
  background: "#0f0f14"
  on-background: "#e8e6f0"
  outline: "#44425c"
  outline-variant: "#2e2d42"
typography:
  display:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: "800"
    lineHeight: 56px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: "700"
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: "600"
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: "600"
    lineHeight: 16px
    letterSpacing: 0.04em
rounded:
  sm: 6px
  DEFAULT: 10px
  md: 14px
  lg: 18px
  xl: 24px
  full: 9999px
spacing:
  unit: 8px
  sidebar-width: 260px
  player-height: 96px
  card-gap: 16px
  section-margin: 32px
components:
  glass-card:
    backgroundColor: rgba(255, 255, 255, 0.06)
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.card-gap}"
  glass-card-hover:
    backgroundColor: rgba(255, 255, 255, 0.1)
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.xl}"
    height: 40px
    padding: 0 20px
  button-primary-hover:
    backgroundColor: "{colors.primary-container}"
  button-ghost:
    backgroundColor: rgba(255, 255, 255, 0.05)
    textColor: "{colors.on-surface}"
    typography: "{typography.label-md}"
    rounded: "{rounded.xl}"
  button-ghost-hover:
    backgroundColor: rgba(255, 255, 255, 0.1)
  sidebar-item:
    rounded: "{rounded.DEFAULT}"
    padding: 10px 14px
  sidebar-item-active:
    backgroundColor: rgba(124, 106, 255, 0.15)
    textColor: "{colors.primary}"
  input-field:
    backgroundColor: rgba(255, 255, 255, 0.06)
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xl}"
    padding: 12px 16px
    height: 44px
  track-row:
    rounded: "{rounded.DEFAULT}"
    padding: 10px 14px
  track-row-hover:
    backgroundColor: rgba(255, 255, 255, 0.05)
  track-row-active:
    backgroundColor: rgba(124, 106, 255, 0.1)
    textColor: "{colors.primary}"
  player-bar:
    backgroundColor: "{colors.surface-container}"
    textColor: "{colors.on-surface}"
    height: "{spacing.player-height}"
  progress-bar:
    rounded: "{rounded.full}"
    height: 4px
  progress-bar-fill:
    backgroundColor: "{colors.primary}"
    rounded: "{rounded.full}"
---

## Brand & Style

CloudBeats is a premium cloud music manager — dark, immersive, and focused. The aesthetic draws from "Neon Abyss": deep dark surfaces with vibrant purple and teal accents that feel like glowing instruments in a dimly lit studio.

Glassmorphism is used sparingly — cards have subtle transparency to reveal the layered depth of the interface without distracting from album art and playback controls.

## Colors

The palette is built on three pillars:

- **Primary (Electric Purple):** The signature accent for CTAs, active states, and the playback progress bar. It evokes creativity and focus.
- **Secondary (Teal/Cyan):** Used for secondary actions, cloud provider badges, and status indicators. It provides a cool counterpoint to the warm purple.
- **Tertiary (Coral Red):** Reserved exclusively for errors, destructive actions, and the "now playing" pulse animation.
- **Neutrals (Obsidian Range):** A carefully calibrated dark scale from near-black to charcoal, ensuring every surface has perceptible depth without harshness.

Gradient usage: The sidebar and player bar use a subtle vertical gradient from `surface-container` to `surface-dim` to create depth anchoring.

## Typography

Inter is the sole typeface, chosen for its excellent legibility on dark backgrounds and its tabular figures (critical for time displays like "3:42 / 5:10").

- **Display:** Used exclusively for the app logo and onboarding headlines.
- **Headlines:** Track titles and section headers. Tight letter-spacing at large sizes feels "locked in."
- **Body:** Artist names, album titles, file paths. Regular weight ensures secondary information stays quiet.
- **Labels:** Duration, bitrate, cloud provider badges, UI controls. Uppercase with expanded letter-spacing for maximum scanability.

## Layout & Spacing

The layout is a fixed three-zone model:

1. **Sidebar (260px):** Navigation, connected cloud accounts, playlists. Collapsible on mobile.
2. **Main Content (fluid):** Library grid, search results, settings. Scrollable with virtual lists for performance.
3. **Player Bar (96px, bottom-fixed):** Now-playing controls, progress, volume. Always visible.

An 8px base grid governs all spacing. Generous padding (16-24px) on cards ensures album art has room to breathe. The player bar's height is fixed to prevent layout shift during playback.

## Elevation & Depth

Depth is achieved through background lightness steps and subtle blur:

- **Level 0:** `surface-dim` — the void behind everything.
- **Level 1:** `surface-container` — sidebar, player bar.
- **Level 2:** `surface-container-high` — cards, modals. Subtle `backdrop-filter: blur(12px)`.
- **Level 3:** `surface-container-highest` — dropdowns, tooltips. `backdrop-filter: blur(20px)`.

All elevated surfaces have a 1px border at `rgba(255,255,255,0.08)` to define edges against dark siblings.

## Shapes

The shape language is "Soft-Technical" — rounded but not bubbly:

- **Cards:** `rounded-lg` (18px) — generous but not circular.
- **Buttons/Inputs:** `rounded-xl` (24px) — pill-like for action elements.
- **Track Rows:** `rounded-DEFAULT` (10px) — enough to feel modern without wasting vertical space.
- **Avatars/Album Art:** `rounded-md` (14px) for grids, `rounded-full` for circular provider icons.

## Components

### Player Bar

Fixed at bottom with a gradient background. The progress bar uses a 4px rail with an 8px draggable thumb that scales to 12px on hover. Playback controls use ghost buttons with a primary-colored active state for the playing indicator.

### Track Rows

Compact horizontal rows with album art thumbnail (48x48), title, artist, duration, and cloud provider badge. Hover reveals action icons (play, add to playlist, download). The active/playing row has a subtle purple tint and a small equalizer animation.

### Cloud Cards

Each connected cloud account is represented by a glass card with the provider's brand color as a left border accent. Connection status uses a small dot indicator (green = connected, gray = disconnected).

### Library Grid

Album art displayed in responsive grid (2-6 columns). Uses `loading="lazy"` and Intersection Observer for progressive image loading. Each card shows album name, artist, and track count on hover with a glass overlay.
