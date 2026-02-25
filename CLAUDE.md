# On the Board — Claude Code Context

A personal sports dashboard tracking three teams: LA Dodgers (MLB), NJ Devils (NHL), NY Sirens (PWHL). Built with React + Vite + Tailwind CSS v4, hosted on Netlify.

---

## Basics

Before starting the project, create a github repo called "On The Board", which will be the name of our app. Create a ReadMe with a concise explanation of the project. 

Create a new branch for each phase. Before completing work, the ReadMe should be updated.

Before moving on to the next phase, commit and push the current phase to github.

Accessibility and best practices for React and Tailwind are important. 

See `sports-dashboard-plan.md` for the full phased build plan. Execute one phase at a time.





## Project Structure

```
on-the-board/
├── src/
│   ├── components/
│   │   ├── TeamSection.jsx
│   │   ├── NextGame.jsx
│   │   ├── LastResult.jsx
│   │   ├── Standings.jsx
│   │   └── PlayerStats.jsx
│   ├── hooks/
│   │   ├── useDodgers.js
│   │   ├── useDevils.js
│   │   └── useSirens.js
│   ├── utils/
│   │   └── dateHelpers.js
│   ├── App.jsx
│   └── main.jsx
├── netlify/
│   └── functions/
│       └── pwhl.js         # Only exists if HockeyTech CORS is blocked
├── index.html
├── vite.config.js
├── netlify.toml
└── package.json
```

---

## Tech Stack

- **React 19 + Vite 6** — use latest stable versions
- **Tailwind CSS v4** — CSS-first config, import via `@import "tailwindcss"` in index.css, configured via `@tailwindcss/vite` plugin. No `tailwind.config.js` unless custom tokens are needed.
- **Netlify** — static hosting + Functions (Node 20)

---

## Data Sources & APIs

### MLB — LA Dodgers
- Base: `https://statsapi.mlb.com/api/v1`
- No auth required, CORS-friendly
- Dodgers team ID: `119`
- Division: NL West, `divisionId: 203`, `leagueId: 104`
- Key endpoints:
  - Schedule: `/schedule?teamId=119&startDate={YYYY-MM-DD}&endDate={YYYY-MM-DD}&sportId=1&hydrate=linescore`
  - Standings: `/standings?leagueId=104&season=2026&standingsTypes=regularSeason`
  - Team leaders: `/teams/119/leaders?leaderCategories=homeRuns,battingAverage,strikeouts&season=2026&leaderGameTypes=R`
- **Current status:** 2026 MLB season starts late March/early April. Show pre-season messaging until then.

### NHL — NJ Devils
- Base: `https://api-web.nhle.com/v1`
- No auth required, CORS-friendly
- Devils tricode: `NJD`
- Division: Metropolitan
- Key endpoints:
  - Schedule: `/club-schedule-season/NJD/now`
  - Standings: `/standings/now`
  - Team stats: `/club-stats/NJD/now`
- OT loss detection: check `periodDescriptor.periodType === 'OT'`
- Player names: use `firstName.default` and `lastName.default`

### PWHL — NY Sirens
- Base: `https://lscluster.hockeytech.com/feed/index.php`
- API key: `446521baf8c38984`, client code: `pwhl`
- Sirens team ID: `5`
- **Current season is 2025-26 (Season 3).** Verify season ID via:
  `?feed=modulekit&view=seasons&key=446521baf8c38984&client_code=pwhl`
- Key endpoints (substitute confirmed `{SEASON_ID}`):
  - Schedule: `?feed=modulekit&view=schedule&season_id={SEASON_ID}&key=...&client_code=pwhl`
  - Standings: `?feed=modulekit&view=standings&season_id={SEASON_ID}&key=...&client_code=pwhl`
  - Player stats: `?feed=modulekit&view=players&season_id={SEASON_ID}&team_id=5&key=...&client_code=pwhl`
- **Test CORS before building the hook.** If blocked, use `netlify/functions/pwhl.js` as a proxy and route via `/api/pwhl` in `vite.config.js` for local dev.
- PWHL uses 3-2-1-0 points system (3 reg win, 2 OT/SO win, 1 OT/SO loss, 0 loss)
- 8 teams in 2025-26: Boston Fleet, Minnesota Frost, Montréal Victoire, New York Sirens, Ottawa Charge, Seattle Torrent, Toronto Sceptres, Vancouver Goldeneyes
- Season runs November 2025 – April 2026. Currently in-season (Olympic break ended Feb 25, 2026).

---

## Key Decisions & Constraints

- All API calls are made client-side from React hooks. No backend except the optional PWHL proxy function.
- Manual refresh only — no polling, no auto-refresh interval.
- Each hook exposes: `{ data, loading, error, refresh }` — consistent shape across all three.
- `Promise.allSettled` for all fetches — one failing endpoint should never crash the whole hook.
- If a sport is in off-season, show a human-readable "Next season starts [date]" message rather than empty cards.
- Today's date is February 24, 2026.

---

## Team Colors

```css
/* Dodgers */
--dodgers-primary: #005A9C;
--dodgers-accent:  #EF3E42;

/* Devils */
--devils-primary:  #CE1126;
--devils-silver:   #A2AAAD;

/* Sirens */
--sirens-primary:  #00827F;
--sirens-accent:   #C8A951;
```

---

## Accessibility

This project follows WCAG 2.1 AA standards. Non-negotiable requirements:

- All color combinations must meet **4.5:1 contrast ratio** for normal text, 3:1 for large text. Verify team accent colors against dark backgrounds — some may need adjustment.
- All interactive elements (refresh button, any links) must be keyboard-focusable with a visible focus ring.
- Use semantic HTML: `<main>`, `<section>`, `<table>`, `<caption>` for standings tables, `<time datetime="...">` for all dates.
- All tables must have `<thead>`, proper `<th scope="col">`, and a visually-hidden `<caption>` describing the table.
- W/L/OTL badges must not convey meaning through color alone — the letter label is required.
- Loading skeletons must have `aria-busy="true"` on their container and `aria-label="Loading [team name] data"`.
- Error states must be announced to screen readers — use `role="alert"` on error messages.
- The refresh button must have a descriptive `aria-label="Refresh all team data"`.
- When refresh is in progress, set `aria-disabled="true"` and update label to `"Refreshing..."`.

---

## Testing

Use **Vitest** + **React Testing Library**. Install:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

Add to `vite.config.js`:
```js
test: {
  environment: 'jsdom',
  setupFiles: './src/test/setup.js',
  globals: true,
}
```

Create `src/test/setup.js`:
```js
import '@testing-library/jest-dom'
```

### What to test

**Hooks** (`src/hooks/__tests__/`)
- Returns correct loading state on mount
- Returns normalized data shape on successful fetch
- Returns error state when fetch fails
- `refresh()` triggers a new fetch cycle
- Uses `Promise.allSettled` — one failed endpoint doesn't kill the rest

**Components** (`src/components/__tests__/`)
- `LastResult` renders W/L/OTL badge correctly for each outcome
- `Standings` highlights the correct team row
- `NextGame` shows home/away pill correctly
- `TeamSection` renders loading skeletons when `loading === true`
- `TeamSection` renders error message when `error` is set

**Accessibility** — use `@testing-library/jest-dom` matchers:
- Tables have accessible `<caption>` and `scope` attributes
- Buttons have accessible names
- Error states have `role="alert"`
- Loading states have `aria-busy="true"`

### Test file naming
Co-locate tests: `src/components/__tests__/LastResult.test.jsx`, `src/hooks/__tests__/useDodgers.test.js`

### Mocking fetches
Use `vi.stubGlobal('fetch', vi.fn())` — mock at the fetch level, not the hook level. Keep fixture JSON files in `src/test/fixtures/` (e.g. `mlb-schedule.json`, `nhl-standings.json`, `pwhl-schedule.json`) so tests don't depend on real API responses.

