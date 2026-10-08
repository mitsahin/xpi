# x-pi

Gamified micro-learning (Duolingo-like UX, original **x-pi** branding). Monorepo with:

| App | Stack |
| --- | --- |
| `apps/api` | Node.js, Express, Prisma, PostgreSQL, JWT |
| `apps/web` | React, TypeScript, Tailwind, Zustand |
| `apps/mobile` | React Native Expo |
| `packages/shared` | Shared types, XP/level curve, modified SM-2, date helpers |

Phase 1 MVP: MCQ + fill-in-blank lessons, XP/levels, timezone-aware streaks, daily XP goal, modified SM-2 SRS.

**Spec:** [`docs/technical-requirements.md`](./docs/technical-requirements.md) · plan: [`docs/x-pi-mvp-plan.md`](./docs/x-pi-mvp-plan.md)

## Repository structure

```
xpi/
├── apps/
│   ├── api/                      # Express + Prisma + PostgreSQL
│   │   ├── prisma/               # schema, migrations, seed.ts (+ seed/ modules)
│   │   └── src/
│   │       ├── routes/           # HTTP adapters (auth, lessons, me)
│   │       ├── services/         # Phase 1 domain orchestration
│   │       ├── engines/          # progression / srs / lesson (extract target)
│   │       ├── controllers/      # future request/response layer
│   │       ├── validators/       # shared Zod schemas (extract target)
│   │       ├── middleware/       # JWT auth (+ future rate limits)
│   │       ├── lib/              # env, prisma, asyncHandler
│   │       └── tests/            # unit + integration placeholders
│   ├── web/                      # React + Vite + Tailwind
│   │   └── src/
│   │       ├── pages/            # route screens
│   │       ├── features/         # auth / learn / reviews (growth)
│   │       ├── components/
│   │       │   ├── marketing/    # `/` landing only
│   │       │   ├── learn/        # `/learn` shell
│   │       │   └── common/       # shared presentational
│   │       ├── hooks/
│   │       ├── stores/           # Zustand barrels → store.ts
│   │       ├── api/ · lib/       # API client
│   │       └── styles/           # tokens.css
│   └── mobile/                   # Expo
│       └── src/
│           ├── screens/
│           ├── components/
│           ├── services/         # API client barrel
│           └── navigation/       # extract from App.tsx
├── packages/
│   └── shared/src/
│       ├── types/                # DTOs
│       ├── constants/            # XP / hearts defaults
│       ├── xp/                   # level curve
│       ├── srs/                  # modified SM-2
│       └── utils/                # dates, normalize
└── docs/
    ├── technical-requirements.md
    ├── x-pi-mvp-plan.md
    ├── ide-handoff.md
    └── security-deps.md
```

Empty folders hold short `README.md` stubs describing purpose — no fake business logic.

## Prerequisites

- Node.js 20+
- PostgreSQL 14+ (or Docker Desktop for the Windows one-shot script)

## Local Windows (API + Postgres)

If the Vite app is up (e.g. `:5173` / `:5174`) but `/api` fails because nothing is listening on `:4000`, run this **one** PowerShell command from the repo root (Docker Desktop must be running; `npm install` already done):

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\dev-api.ps1
```

That script starts Postgres in Docker (if needed), writes `apps/api/.env`, runs migrate + seed, then starts `npm run dev:api` on **http://localhost:4000**. Leave that window open; keep `npm run dev:web` in another terminal. Demo login: `demo@x-pi.app` / `demo1234`.

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
cd apps/api
npx prisma migrate deploy   # use `migrate dev` only when changing the schema
npx prisma generate
npx tsx prisma/seed.ts
cd ../..
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

## CI

GitHub Actions (`.github/workflows/ci.yml`) installs deps, migrates Postgres, seeds, typechecks the API, and builds the web app on pushes/PRs to `main`.

## API overview

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/auth/register` | Create user + JWT |
| POST | `/auth/login` | Login |
| GET | `/auth/me` | Current user |
| GET | `/lessons` | Path with lock/complete state |
| GET | `/lessons/:id/active` | In-progress session (resume probe) |
| POST | `/lessons/:id/start` | Start or resume lesson (`forceNew` to abandon) |
| POST | `/lessons/sessions/:id/answer` | Submit answer (MCQ / fill / translate / listen / match) |
| GET | `/me/stats` | XP, level progress, streak, daily goal |
| GET | `/me/queue` | Daily lesson + due SRS reviews |
| GET | `/me/reviews` | Due SRS cards |
| POST | `/me/reviews/:cardId/answer` | Answer a review |

## Architecture notes

- **XP**: Idempotent via unique `XpEvent(userId, reason, refId)` + atomic user XP update (safe under concurrent completes).
- **Streaks**: Calendar day in the user’s IANA timezone; consecutive days increment, gaps reset.
- **SRS**: Modified SM-2 (`packages/shared`) schedules `SrsCard.dueAt` from lesson answers.
- **Lessons**: Session state machine (IN_PROGRESS → COMPLETED / ABANDONED); Phase 1 question types: `MCQ`, `FILL_BLANK`.

## Web routes

| Path | Shell |
| --- | --- |
| `/` | Marketing landing (`MarketingHero`) |
| `/auth` | Login / register |
| `/learn` | Duolingo-like lesson path (`LessonShell`) |
| `/learn/lesson/:id` | Lesson session |
| `/learn/reviews` | Due SRS reviews |
| `/learn/profile` | Profile / stats |

## Demo path

1. Start API + web — open `/` for the marketing landing, then **Start learning**.
2. Log in as demo user → `/learn` path → play **Greetings** (MCQ + fill-blank).
3. Finish lesson → see XP / streak / daily goal update on home + profile.
4. Mobile: light splash → login → Learn tab → lesson → Profile.
