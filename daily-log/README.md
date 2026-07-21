# Daily Log

Frontend-only daily tracking app built with React + Vite.

## Tech

- React (functional components)
- React Router
- Tailwind CSS
- Framer Motion
- Recharts
- React Calendar Heatmap
- LocalStorage (no backend)

## Features

- Dashboard with quick stats and recent logs
- Analytics page with score, study, sleep, and Instagram charts
- Settings page with JSON export/import/reset tools
- GitHub-style yearly heatmap
- Daily log form fields:
  - score
  - mood
  - study hours
  - sleep hours
  - bedtime
  - Instagram minutes
  - habits
  - notes
- Current and longest streak
- Dark mode persistence
- Responsive layout

## Local Data Model

All data is stored in browser localStorage under:

- `daily-log-entries`
- `daily-log-theme`

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy to Vercel

This project is ready to deploy as a Vite single-page app.

1. Push the `daily-log` folder to a Git repository, or import the repository in Vercel.
2. If the repository contains the parent `Day tracker` folder, set Vercel's **Root Directory** to `daily-log`.
3. Leave the detected settings as:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Deploy.

`vercel.json` includes an SPA rewrite so direct visits to `/analytics` and `/settings` load correctly.
