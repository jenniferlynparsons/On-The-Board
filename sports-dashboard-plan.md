# Sports Dashboard — Build Plan

A React + Vite + Tailwind dashboard tracking the LA Dodgers (MLB), NJ Devils (NHL), and NY Sirens (PWHL). Hosted on Netlify. Data pulled from free public APIs.

---

## Data Sources

| Team | API Base URL | Auth | Notes |
|------|-------------|------|-------|
| LA Dodgers | `https://statsapi.mlb.com/api/v1` | None | Free, CORS-friendly, well-documented |
| NJ Devils | `https://api-web.nhle.com/v1` | None | Free, CORS-friendly, community-mapped |
| NY Sirens | `https://lscluster.hockeytech.com/feed/` | API key in URL (`key=446521baf8c38984&client_code=pwhl`) | **Test CORS first** — if blocked, add Netlify Function proxy |

### Key IDs
- Dodgers MLB team ID: `119`
- Devils NHL tricode: `NJD`
- Sirens PWHL team ID: `5` (confirm via seasons endpoint)
- PWHL 2025-26 season ID: likely `6` — verify via `?feed=modulekit&view=seasons&key=446521baf8c38984&client_code=pwhl`

---

## Tech Stack

- **React + Vite** — fast scaffold, simple config
- **Tailwind CSS v4** — utility-first, dark mode via class strategy
- **Netlify** — static hosting + Functions (if needed for PWHL CORS)
- **GitHub** — repo connected to Netlify for auto-deploy on push

---

## Project Structure

```
sports-dashboard/
├── src/
│   ├── components/
│   │   ├── TeamSection.jsx       # Shared column wrapper (banner + cards)
│   │   ├── NextGame.jsx          # Next scheduled game card
│   │   ├── LastResult.jsx        # Most recent game result card
│   │   ├── Standings.jsx         # Division standings mini-table
│   │   └── PlayerStats.jsx       # Top 3 team stat leaders card
│   ├── hooks/
│   │   ├── useDodgers.js         # Fetches MLB API directly
│   │   ├── useDevils.js          # Fetches NHL API directly
│   │   └── useSirens.js          # Fetches HockeyTech API (or /api/pwhl proxy)
│   ├── utils/
│   │   └── dateHelpers.js        # fmtDate, fmtTime, etc.
│   ├── App.jsx
│   └── main.jsx
├── netlify/
│   └── functions/
│       └── pwhl.js               # CORS proxy — only add if needed
├── public/
├── index.html
├── vite.config.js                # Dev proxy: /api/pwhl → HockeyTech
├── netlify.toml                  # Build config + function redirect
├── tailwind.config.js
└── package.json
```

---

## Phase 1 — Scaffold & Config

**Goal:** Working dev environment, nothing breaks, Tailwind renders.

### Steps

1. Scaffold the project:
   ```bash
   npm create vite@latest sports-dashboard -- --template react
   cd sports-dashboard
   npm install
   ```

2. Install Tailwind CSS v4:
   ```bash
   npm install tailwindcss @tailwindcss/vite
   ```

3. Configure Vite (`vite.config.js`):
   ```js
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'
   import tailwindcss from '@tailwindcss/vite'

   export default defineConfig({
     plugins: [react(), tailwindcss()],
   })
   ```

4. Add to `src/index.css`:
   ```css
   @import "tailwindcss";
   ```

5. Create `netlify.toml`:
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"

   [functions]
     directory = "netlify/functions"

   [[redirects]]
     from = "/api/pwhl/*"
     to = "/.netlify/functions/pwhl/:splat"
     status = 200
   ```

6. Initialize Git repo, push to GitHub, connect to Netlify.

7. Verify: `npm run dev` → blank page with no errors.

---

## Phase 2 — Static Layout with Mock Data

**Goal:** Full visual design complete before touching any API. All three columns, all four card types, team colors applied.

### Steps

1. Set up CSS custom properties in `index.css` (or Tailwind config) for team colors:
   - **Dodgers:** primary `#005A9C`, accent `#EF3E42`
   - **Devils:** primary `#CE1126`, accent `#000000`, silver `#A2AAAD`
   - **Sirens:** primary `#00827F`, accent `#C8A951`

2. Build `App.jsx` with a 3-column grid layout using Tailwind.

3. Build `TeamSection.jsx` — accepts props: `teamName`, `league`, `division`, `record`, `colorPrimary`, `colorAccent`, `children`.

4. Build each card component with hardcoded mock data:
   - `NextGame.jsx` — opponent, date/time, home/away pill
   - `LastResult.jsx` — W/L/OTL badge, opponent, score, date
   - `Standings.jsx` — table with 5-8 rows, highlight current team row
   - `PlayerStats.jsx` — 3 rows: player name, stat category, value

5. Assemble all three columns in `App.jsx` using mock data.

6. Add refresh button in header (no functionality yet — just UI).

7. Add loading skeleton component for use in Phase 3+.

**Deliverable:** Pixel-complete dashboard with hardcoded data. No API calls yet.

---

## Phase 3 — MLB Hook (Dodgers)

**Goal:** Replace Dodgers mock data with live MLB Stats API data.

### Endpoints Used
- Schedule (recent + upcoming): `GET /schedule?teamId=119&startDate={-10d}&endDate={+14d}&sportId=1&hydrate=linescore`
- Standings (NL West, divisionId 203): `GET /standings?leagueId=104&season=2025&standingsTypes=regularSeason`
- Team leaders: `GET /teams/119/leaders?leaderCategories=homeRuns,battingAverage,strikeouts&season=2025&leaderGameTypes=R`

### Steps

1. Create `src/utils/dateHelpers.js` with `fmtDate()` and `fmtTime()` helpers.

2. Create `src/hooks/useDodgers.js`:
   - State: `{ record, nextGame, lastResult, standings, stats, loading, error }`
   - On mount and on manual `refresh()` call: fetch all three endpoints via `Promise.allSettled`
   - Parse and return normalized data shape

3. Wire `useDodgers` into the Dodgers `TeamSection` in `App.jsx`.

4. Replace mock data props with live data.

5. Show loading skeletons while `loading === true`.

6. Show inline error messages if individual fetches fail (don't crash the whole card).

7. Wire the refresh button in the header to call `refresh()` on all hooks.

**Notes:**
- MLB season starts late March/early April — between now and then, `nextGame` may return empty. Handle gracefully with "Spring Training" or "Season starts [date]" message.
- Check `abstractGameState` for game status: `"Final"`, `"Live"`, `"Preview"`

---

## Phase 4 — NHL Hook (Devils)

**Goal:** Replace Devils mock data with live NHL API data.

### Endpoints Used
- Schedule: `GET /club-schedule-season/NJD/now`
- Standings: `GET /standings/now`
- Team stats (skaters): `GET /club-stats/NJD/now`

### Steps

1. Create `src/hooks/useDevils.js` — same structure as `useDodgers.js`.

2. Parse standings — filter for `divisionName === 'Metropolitan'` (8 teams in Metro division).

3. Parse schedule — split into `upcoming` (gameState not `OFF`/`FINAL`) and `past` (gameState `OFF` or `FINAL`).

4. Handle OT losses — check `periodDescriptor.periodType === 'OT'` for the badge.

5. Player stats — sort skaters by `points` descending, take top 3.

6. Wire into Devils `TeamSection`, replace mock data.

**Notes:**
- NHL tricode for Devils: `NJD`
- Devils team ID in standings response: `1`
- The NHL API returns `commonName.default` for human-readable team names

---

## Phase 5 — PWHL Hook (NY Sirens)

**Goal:** Replace Sirens mock data with live PWHL data via HockeyTech API.

### Step 1 — CORS Test (do this first)

Before writing any hook code, open browser DevTools console and run:
```js
fetch('https://lscluster.hockeytech.com/feed/index.php?feed=modulekit&view=seasons&key=446521baf8c38984&client_code=pwhl')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

**If it works → skip to Step 3.**
**If CORS error → do Step 2.**

### Step 2 — Netlify Function (only if CORS blocked)

Create `netlify/functions/pwhl.js`:
```js
const fetch = require('node-fetch')

const BASE = 'https://lscluster.hockeytech.com/feed/index.php'
const KEY = '446521baf8c38984'
const CLIENT = 'pwhl'

exports.handler = async (event) => {
  const params = new URLSearchParams(event.queryStringParameters)
  params.set('key', KEY)
  params.set('client_code', CLIENT)

  const res = await fetch(`${BASE}?${params}`)
  const data = await res.json()

  return {
    statusCode: 200,
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(data),
  }
}
```

Add dev proxy to `vite.config.js`:
```js
server: {
  proxy: {
    '/api/pwhl': {
      target: 'https://lscluster.hockeytech.com',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api\/pwhl/, '/feed/index.php'),
    }
  }
}
```

### Step 3 — Confirm Season ID

Hit the seasons endpoint and find the 2025-26 season ID:
```
GET ?feed=modulekit&view=seasons&key=446521baf8c38984&client_code=pwhl
```
Look for the record where season name contains "2025-26". Note the `season_id`.

### Step 4 — Build `useSirens.js`

Endpoints (substitute confirmed season ID for `{SEASON_ID}`):
- Schedule: `?feed=modulekit&view=schedule&season_id={SEASON_ID}&key=...&client_code=pwhl`
- Standings: `?feed=modulekit&view=standings&season_id={SEASON_ID}&key=...&client_code=pwhl`
- Player stats: `?feed=modulekit&view=players&season_id={SEASON_ID}&team_id=5&key=...&client_code=pwhl`

NY Sirens team ID: `5` (verify this hasn't changed for Season 3 — the teams.csv in the PWHL-Data-Reference repo has the mapping).

### Step 5 — Wire and test

Replace Sirens mock data, verify all four cards populate correctly.

**Notes:**
- PWHL uses a 3-2-1-0 points system (3 pts regulation win, 2 OT/SO win, 1 OT/SO loss)
- The league is currently in-season (Nov 2025 – Apr 2026, Olympic break ended Feb 25)
- 8 teams in 2025-26: Boston, Minnesota, Montreal, NY, Ottawa, Toronto, Seattle, Vancouver

---

## Phase 6 — Deploy & Polish

**Goal:** Live on Netlify, production-ready.

### Steps

1. Push to GitHub — Netlify auto-deploys on merge to `main`.

2. Smoke test all three data sources in production (not just dev).

3. Add polish:
   - "Last updated" timestamp in header
   - Season-aware messaging: if a sport is in off-season, show next season start date instead of empty cards
   - Graceful degradation: if one team's API is down, other columns still load

4. (Optional) Add a custom domain if you have one you want to point at this.

---

## Notes & Decisions to Revisit

- **PWHL CORS:** Don't assume — test before building the hook. The Netlify Function is a 20-line fallback.
- **MLB off-season:** We're currently pre-season for MLB (season starts late March/April 2026). The schedule endpoint will return spring training games — decide whether to show those or show a "Season starts [date]" message.
- **Tailwind v4:** Uses a CSS-first config approach — no `tailwind.config.js` required for basic usage. Add it only if you need custom theme tokens beyond what CSS variables can handle.
- **API keys:** The HockeyTech API key is publicly documented in the community repo — it's not a secret. Still, keep it in the Netlify Function (if used) rather than client-side code as a good habit.
