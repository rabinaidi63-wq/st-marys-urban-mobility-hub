# St Mary's Urban Mobility Hub

A React front-end web application for CPS4006 (Web Design and Development)
that helps users compare urban travel options — bus, rail, cycling and
walking — in one place, with live TfL data where relevant.

## Features

- **Homepage** — travel guidance and a live service-status snapshot.
- **Travel modes** — descriptions, benefits and limitations per mode.
- **Fare estimator** — distance + mode → estimated cost range (static rules).
- **Journey comparison** — side-by-side cost/time comparison of two modes,
  with last inputs remembered via `localStorage`.
- **Journey planner** — real route options between two locations, via the
  TfL Journey API.
- **Nearby stops** — closest bus stops/stations to a location or your
  current position, via the TfL StopPoint API.
- **Bike share** — live Santander Cycles dock availability, via the TfL
  BikePoint API.
- **Dashboard** — save favourite journeys and a preferred mode.
- **Alerts** — subscribe to lines/routes and see live disruptions that
  match, prioritised by how you've flagged them.
- **Sustainability** — estimated CO2e comparison across modes, plus a
  weekly low-carbon distance goal with progress tracking.

## Getting started

```bash
npm install
npm run dev
```

The app runs entirely client-side — no backend server is required.

### Live data (optional but recommended)

The app calls the public [TfL Unified API](https://api.tfl.gov.uk), which
works unauthenticated at a shared, rate-limited tier. For reliable testing,
register a free key at <https://api-portal.tfl.gov.uk/> and add it to a
`.env` file (see `.env.example`):

```
VITE_TFL_APP_KEY=your-key-here
```

## Build

```bash
npm run build
npm run preview   # serve the production build locally
```

## Project structure

```
src/
  api/          TfL API client
  components/   Shared layout (header, footer, route divider, status ticker)
  data/         Static reference data (modes, fare rates, carbon factors)
  hooks/        useLocalStorage, useApiData
  pages/        One file per route
```

## Notes on scope

Fare and emissions figures are illustrative, transparent per-km estimates —
not live pricing or an official carbon calculator — since the brief only
requires *live* data for service status, journey planning, nearby stops and
shared mobility.
