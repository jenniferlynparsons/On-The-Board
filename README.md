# On The Board

A personal sports dashboard tracking three teams:
- **LA Dodgers** (MLB)
- **NJ Devils** (NHL)
- **NY Sirens** (PWHL)

Built with React + Vite + Tailwind CSS v4, hosted on Netlify.

## Project Overview

This dashboard provides real-time stats and schedules for three favorite sports teams across different leagues. Data is pulled from free public APIs with no backend required (except an optional Netlify Function proxy for PWHL CORS if needed).

## Features

- **Next Game** — upcoming opponent, date/time, home/away
- **Last Result** — most recent game outcome, final score
- **Standings** — division standings with team highlighted
- **Player Stats** — top 3 team stat leaders
- **Manual Refresh** — pull latest data on demand
- **Accessible Design** — WCAG 2.1 AA compliant

## Tech Stack

- **React 19** + **Vite 6** — fast dev experience
- **Tailwind CSS v4** — utility-first styling
- **Netlify** — hosting + optional Functions
- **Vitest** + **React Testing Library** — testing

## Data Sources

- **MLB (Dodgers):** [MLB Stats API](https://statsapi.mlb.com/api/v1)
- **NHL (Devils):** [NHL Web API](https://api-web.nhle.com/v1)
- **PWHL (Sirens):** [HockeyTech API](https://lscluster.hockeytech.com/feed/)

All APIs are free and require no authentication.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Building

```bash
npm run build
npm run preview
```

## Testing

```bash
npm test
```

## Development Status

**Phase 1 — Scaffold & Config** ✓ Complete
- Project structure initialized with Vite, Tailwind CSS v4, and testing framework configured

**Phase 2 — Static Layout with Mock Data** ✓ Complete
- 3-column responsive grid layout (1 col mobile, 2 cols tablet, 3 cols desktop)
- All card components built: NextGame, LastResult, Standings, PlayerStats
- TeamSection wrapper component with team banner and error/loading states
- LoadingSkeleton component with animated placeholders
- Header with refresh button and last updated timestamp
- Mock data for all three teams (Dodgers, Devils, Sirens)
- Team colors applied with CSS custom properties
- Accessibility features: semantic HTML, ARIA labels, sr-only elements, captions on tables

**Phase 3 — MLB Hook (Dodgers)** ✓ Complete
- Created `dateHelpers.js` utility with formatting functions (fmtDate, fmtTime, getDateRange)
- Built `useDodgers.js` hook with live MLB Stats API integration
- Hook fetches 3 endpoints: schedule, standings, team leaders
- Uses Promise.allSettled for graceful error handling
- Parses game schedules (next game and last result with outcomes)
- Automatically detects W/L/OTL outcomes based on game data
- Extracts standings and player stats from MLB API
- Integrated hook into App.jsx for live Dodgers data
- Refresh button calls hook's refresh method
- Falls back to spring training message when season hasn't started

**Phase 4 — NHL Hook (Devils)** ✓ Complete
- Built `useDevils.js` hook with live NHL API integration
- Hook fetches 3 endpoints: schedule, standings, club stats
- Parses game schedules with home/away detection
- Detects OT losses via `periodDescriptor.periodType === 'OT'`
- Extracts Metropolitan division standings
- Gets top 3 skaters by points (uses player name formatting)
- Integrated hook into App.jsx for live Devils data
- Refresh button now calls both Dodgers and Devils hooks in parallel
- Parses team names from `.commonName.default` structure

**Phase 5 — PWHL Hook (NY Sirens)** ✓ Complete
- Created `useSirens.js` hook with live HockeyTech API integration
- Built Netlify Function (`netlify/functions/pwhl.js`) as CORS proxy
- Hook fetches 3 endpoints: schedule, standings, player stats
- Confirmed 2025-26 season ID: `8` via seasons endpoint
- Parses game schedules with W/L/OTL outcome detection
- Detects OT/SO losses via `game_status === '4'`
- Extracts PWHL standings with win/loss/OTL and points (3-2-1-0 system)
- Gets top 3 skaters by points (excluding goalies)
- Integrated hook into App.jsx for live Sirens data
- Refresh button now calls all three team hooks in parallel
- Vite dev proxy configured to route `/api/pwhl` requests to HockeyTech API
