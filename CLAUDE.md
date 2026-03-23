# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at localhost:5173
npm run build    # TypeScript check + production build
npm run lint     # ESLint
```

Node.js must be loaded via nvm in this environment:
```bash
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

## API Key Setup

Add your Google Places API key to `.env.local`:
```
VITE_GOOGLE_PLACES_API_KEY=AIza...
```

At [console.cloud.google.com](https://console.cloud.google.com): enable **Places API (New)**, create an API key, restrict it to HTTP referrer `localhost:5173/*` and to Places API only.

## Architecture

Single-page web app: Vite + React + TypeScript. The map fills the entire viewport; the search bar and detail panel float as `position: fixed` overlays.

**Data flow:**
1. User searches → `usePlacesSearch` hook (debounced 300ms) → Google Places `searchText` API → results dropdown
2. User selects restaurant → `selectRestaurant()` in Zustand store → `DetailPanel` slides in
3. User marks visited → `markVisited()` → writes to IndexedDB → Zustand store updates → pin appears on map
4. On app load → `loadUserData()` reads IndexedDB → rehydrates all visited pins

**Key layers:**

| Layer | File | Purpose |
|---|---|---|
| Types | `src/types/index.ts` | `Restaurant`, `UserVisit`, `UserPhoto` interfaces |
| DB | `src/db/index.ts` | IndexedDB via `idb`: stores `restaurants`, `userVisits`, `userPhotos` |
| Store | `src/store/useAppStore.ts` | Zustand: all UI + user data state, async actions |
| API | `src/api/places.ts` | Google Places `searchText` + photo URL construction |
| Map | `src/components/MapView/` | `react-leaflet` centered on Melbourne, pins for visited restaurants |
| Search | `src/components/SearchBar/` | Floating search input with results dropdown |
| Panel | `src/components/DetailPanel/` | Slide-in panel with restaurant info, photos, visit form |
| Form | `src/components/VisitForm/` | Star rating, notes textarea, photo upload via `react-dropzone` |

**Storage:** User data (visited status, ratings, notes, uploaded photos) persists in IndexedDB (`FoodMapDB`). Photos are stored as raw `Blob`s — use `URL.createObjectURL()` to display and always revoke in cleanup.

**Google Places photos:** `googlePhotoRefs` in the `Restaurant` model are resource name strings (e.g. `places/ChIJ.../photos/AUc7...`), not URLs. Construct the URL via `getPhotoUrl()` in `src/api/places.ts`.

**Directions:** Opens Google Maps in a new tab via deep-link URL — no API key required. Origin is prefilled from `navigator.geolocation` when available.

**TypeScript:** `verbatimModuleSyntax` is enabled — always use `import type` for type-only imports.
