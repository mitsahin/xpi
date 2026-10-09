# Walky Talky

Frontend-only gamified language learning demo for the x-pi monorepo. Progress (streak, XP, lesson nodes) persists in **localStorage** — no backend required.

## Stack

- React 19 + Vite + TypeScript
- Tailwind CSS v4
- React Router
- Zustand (persist)
- Lucide React icons

## Run locally

From the repository root:

```bash
npm install
npm run dev:walky
```

Open [http://localhost:5174](http://localhost:5174).

From this package:

```bash
npm run dev -w @x-pi/walky-talky
```

## Routes

| Path | Description |
|------|-------------|
| `/` | Landing — bee + walkie-talkie mascot, CTA to learn |
| `/learn` | Vertical skill path with locked / active / completed nodes |
| `/lesson/:id` | MCQ exercise, mock “Telsizden Dinle”, voice mock |
| `/voice` | Standalone push-to-talk demo |

## Design

Emerald primary, amber streak accents, `rounded-2xl` / `rounded-3xl` surfaces. Original SVG mascot — no third-party brand assets.
