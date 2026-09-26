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
1. **Hardcoded `EMOJIS` array** (202 entries): emoji objects with `{ name, category, path, ext, id }` where `path` is a relative `emojis/<category>/<file>` URL served from the local filesystem.
2. **Convex backend** (`convex/`): dynamically uploaded emojis fetched via `ConvexHttpClient` on page load. Stored in Convex file storage; objects have the same shape but `path` is a Convex CDN URL and carry `isNew: true`.

`getAllEmojis()` merges both arrays. Convex emojis append after hardcoded ones with sequential IDs.

**Convex backend** (`convex/`):
- `schema.ts`: `emojis` table: `{ name, category, ext, storageId }`
- `emojis.ts`: `list` query (returns URLs from storage; skips rows whose fields hold HTML metacharacters), `getUploadUrl` + `saveEmoji` mutations. Both mutations require `UPLOAD_PASSWORD`; `saveEmoji` also checks the name charset and length, the category, the stored content type (PNG, JPEG, GIF, WebP) and size (2 MB), and caps the table at 1000 rows and 60 uploads an hour. The page repeats these checks only to show the reason early.
- `auth.ts`: `checkPassword` action (reads `UPLOAD_PASSWORD` env var)

**Upload flow:** password gate → `auth:checkPassword` action → password held in memory (a reload asks again) → drag-and-drop file → `getUploadUrl` mutation (with password) → `fetch` POST to Convex storage → `saveEmoji` mutation (with password) → reload grid.

**Key JS functions in `index.html`:**
- `getAllEmojis()`: merges hardcoded + Convex emojis
- `filterGrid()`: applies active category + search query, calls `renderGrid()`
- `rebuildChips()`: builds category filter buttons from merged emoji set
- `loadConvexEmojis()`: fetches from Convex, silently falls back if unconfigured
- `copyEmoji()`: Canvas-based clipboard copy (GIFs unsupported, skips to toast)
- `makeCard(e)`: builds emoji card DOM element with overlay buttons. Name, ext and category of uploaded emojis are public stored data: set them with `textContent`, never `innerHTML`.

**Emoji categories:** `argentina`, `chile`, `development`, `essentials`, `logos`, `parrots`, `think`, `uncategorized`

**Design tokens:**
- bg: `#050c14` · accent: `#38bdf8` (ice blue) · surface: `rgba(255,255,255,.03)`
- header gradient: `135deg, #0369a1 0%, #0c1a2e 45%, #050c14 100%`
- font: Avenir Next · font-mono: SF Mono / Fira Code

## Content Security Policy

`index.html` carries a strict `<meta http-equiv="Content-Security-Policy">`: `default-src 'none'`, no `'unsafe-inline'` for scripts, `base-uri 'none'`, `form-action 'none'`. `404.html` has its own policy with no scripts at all. Two edits break it silently in production, with nothing but a console error to show for it:

- **Any edit to the inline `<script type="module">`** (the `EMOJIS` array, `CONVEX_URL`, any function) changes its sha256. The browser then refuses the whole script, so the grid, search and uploads all stop. After the edit, run `bash scripts/smoke.sh --only=29` from the monorepo root: it prints the `'sha256-...'` the page now needs, and names the stale pin to replace in `script-src`. The other hash in `script-src` is the Header Kit's theme guard, the same on every site.
- **A new runtime origin.** `script-src` pins exact esm.sh paths (`convex@1.21.0/`, `jwt-decode@%5E3.1.2`, `jwt-decode@3.1.2/`), and `img-src` / `connect-src` name only this deployment's `/api/storage/` and `/api/` paths. Bumping the Convex client or moving deployments means editing those entries in the same commit.

Inline `on*=` attributes, in HTML or in JS strings, are refused by the policy: use `addEventListener`. `frame-ancestors` and `X-Content-Type-Options` do nothing in a meta tag, which is why neither is here.

## Adding Emojis

**Static (hardcoded):** Place the file in `emojis/<category>/`, add an entry to the `EMOJIS` array in `index.html` with the next sequential `id`, and update the count in `<title>`, `<meta name="description">`, and `.header-subtitle`. Then re-stamp the script hash in the CSP (see above), or the whole page stops working.

**Dynamic (via UI):** Use the Upload panel with the `UPLOAD_PASSWORD` Convex env var set.

## Convex Configuration

The `CONVEX_URL` is hardcoded at the top of the `<script>` block in `index.html`. After running `npx convex dev` for the first time, update this URL to match your deployment, change the host in the CSP's `img-src` and `connect-src` to match, and re-stamp the script hash. Set `UPLOAD_PASSWORD` in the Convex dashboard under Environment Variables.
