# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
make setup      # npm install + deploy Convex functions (first-time setup)
make dev        # Run Convex dev server (deploys functions + watches for changes)
make serve      # Serve site locally on port 8777 (python3 -m http.server 8777)
make deploy     # Deploy Convex functions to production
make login      # Authenticate with Convex (npx convex login)
```

**Live:** emojis.neorgon.com · **Port:** 8777

## Architecture

Single-file app (`index.html`) with all CSS and JS embedded inline. No build step.

**Two data sources, merged at runtime:**
1. **Hardcoded `EMOJIS` array** (202 entries) — emoji objects with `{ name, category, path, ext, id }` where `path` is a relative `emojis/<category>/<file>` URL served from the local filesystem.
2. **Convex backend** (`convex/`) — dynamically uploaded emojis fetched via `ConvexHttpClient` on page load. Stored in Convex file storage; objects have the same shape but `path` is a Convex CDN URL and carry `isNew: true`.

`getAllEmojis()` merges both arrays. Convex emojis append after hardcoded ones with sequential IDs.

**Convex backend** (`convex/`):
- `schema.ts` — `emojis` table: `{ name, category, ext, storageId }`
- `emojis.ts` — `list` query (returns URLs from storage), `getUploadUrl` + `saveEmoji` mutations
- `auth.ts` — `checkPassword` action (reads `UPLOAD_PASSWORD` env var)

**Upload flow:** password gate → `auth:checkPassword` action → sessionStorage flag → drag-and-drop file → `getUploadUrl` mutation → `fetch` POST to Convex storage → `saveEmoji` mutation → reload grid.

**Key JS functions in `index.html`:**
- `getAllEmojis()` — merges hardcoded + Convex emojis
- `filterGrid()` — applies active category + search query, calls `renderGrid()`
- `rebuildChips()` — builds category filter buttons from merged emoji set
- `loadConvexEmojis()` — fetches from Convex, silently falls back if unconfigured
- `copyEmoji()` — Canvas-based clipboard copy (GIFs unsupported, skips to toast)
- `makeCard(e)` — builds emoji card DOM element with overlay buttons

**Emoji categories:** `argentina`, `chile`, `development`, `essentials`, `logos`, `parrots`, `think`, `uncategorized`

**Design tokens:**
- bg: `#050c14` · accent: `#38bdf8` (ice blue) · surface: `rgba(255,255,255,.03)`
- header gradient: `135deg, #0369a1 0%, #0c1a2e 45%, #050c14 100%`
- font: Avenir Next · font-mono: SF Mono / Fira Code

## Adding Emojis

**Static (hardcoded):** Place the file in `emojis/<category>/`, add an entry to the `EMOJIS` array in `index.html` with the next sequential `id`, and update the count in `<title>`, `<meta name="description">`, and `.header-subtitle`.

**Dynamic (via UI):** Use the Upload panel with the `UPLOAD_PASSWORD` Convex env var set.

## Convex Configuration

The `CONVEX_URL` is hardcoded at the top of the `<script>` block in `index.html`. After running `npx convex dev` for the first time, update this URL to match your deployment. Set `UPLOAD_PASSWORD` in the Convex dashboard under Environment Variables.
