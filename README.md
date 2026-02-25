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

Project structure initialized with Vite, Tailwind CSS v4, and testing framework configured.
