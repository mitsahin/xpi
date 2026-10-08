# x-pi

Gamified micro-learning (Duolingo-like UX, original **x-pi** branding). Monorepo with:

| App | Stack |
| --- | --- |
| `apps/api` | Node.js, Express, Prisma, PostgreSQL, JWT |
| `apps/web` | React, TypeScript, Tailwind, Zustand |
| `apps/mobile` | React Native Expo |
| `packages/shared` | Shared types, XP/level curve, modified SM-2, date helpers |

Phase 1 MVP: MCQ + fill-in-blank lessons, XP/levels, timezone-aware streaks, daily XP goal, modified SM-2 SRS.

## Prerequisites

- Node.js 20+
- PostgreSQL 14+

## Setup

```bash
# 1) Install
npm install

# 2) Database
createdb xpi   # or use Docker / existing Postgres
cp apps/api/.env.example apps/api/.env
# edit DATABASE_URL / JWT_SECRET as needed

# 3) Build shared + migrate + seed
npm run build -w @x-pi/shared
cd apps/api && npx prisma migrate dev && npx tsx prisma/seed.ts && cd ../..
```

Demo user from seed:

- Email: `demo@x-pi.app`
- Password: `demo1234`

## Run

```bash
# API — http://localhost:4000
npm run dev:api

# Web — http://localhost:5173  (proxies /api → :4000)
npm run dev:web

# Mobile — Expo (set API URL for device/emulator)
EXPO_PUBLIC_API_URL=http://localhost:4000 npm run dev:mobile
# On a physical device, use your machine LAN IP instead of localhost.
```

## API overview

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/auth/register` | Create user + JWT |
| POST | `/auth/login` | Login |
| GET | `/auth/me` | Current user |
| GET | `/lessons` | Path with lock/complete state |
| POST | `/lessons/:id/start` | Start lesson session |
| POST | `/lessons/sessions/:id/answer` | Submit MCQ / fill-blank |
| GET | `/me/stats` | XP, level progress, streak, daily goal |
| GET | `/me/queue` | Daily lesson + due SRS reviews |
| GET | `/me/reviews` | Due SRS cards |
| POST | `/me/reviews/:cardId/answer` | Answer a review |

## Architecture notes

- **XP**: Idempotent via unique `XpEvent(userId, reason, refId)` + atomic user XP update (safe under concurrent completes).
- **Streaks**: Calendar day in the user’s IANA timezone; consecutive days increment, gaps reset.
- **SRS**: Modified SM-2 (`packages/shared`) schedules `SrsCard.dueAt` from lesson answers.
- **Lessons**: Session state machine (IN_PROGRESS → COMPLETED / ABANDONED); Phase 1 question types: `MCQ`, `FILL_BLANK`.

## Demo path

1. Start API + web, log in as demo user.
2. Open unit path → play **Greetings** (MCQ + fill-blank).
3. Finish lesson → see XP / streak / daily goal update on home + profile.
4. Mobile: same login → Learn tab → lesson → Profile.
