# Walky Talky (xpi monorepo)

Gamified micro-learning (Duolingo-like UX, **Walky Talky** branding). Monorepo with:

| App | Stack |
| --- | --- |
| `apps/api` | Node.js, Express, Prisma, PostgreSQL, JWT |
| `apps/web` | React, TypeScript, Tailwind, Zustand |
| `apps/mobile` | React Native Expo |
| `packages/shared` | Shared types, XP/level curve, modified SM-2, date helpers |

Phase 1 MVP: MCQ + fill-in-blank lessons, XP/levels, timezone-aware streaks, daily XP goal, modified SM-2 SRS.

> **Homepage on `main`:** `/` defaults to the **H2 centered bee** landing (`BeeHomeHero`).
> There is **no** cinematic “Preview themes A/B/C” / navy sphere on `main` — that lives only on the unmerged cinematic branch (PR #2).
>
> If localhost still shows cinematic themes, you are **not on `main`**. To see the H2 bee homepage run:
> `powershell -ExecutionPolicy Bypass -File .\scripts\dev-web-main.ps1`
>
> That script **hard-resets** local `main` to `origin/main` (discards dirty files such as `package-lock.json`). Use it when `git pull` refuses to run.

### Get H2 bee homepage (PowerShell — run each line separately)

```powershell
git fetch origin
git checkout main
git reset --hard origin/main
npm run dev:web
```

Or one shot (bypasses a restrictive execution policy):

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\dev-web-main.ps1
```

Then open `http://localhost:5173/` (or `:5174`). You should see the bee and **“Dili oyun gibi öğren”**.

Legacy atmospheric hero (not cinematic A/B/C): `http://localhost:5173/?home=legacy`

## Technical requirements

Full production spec (frontend + backend, AuthN/AuthZ, security, algorithms, folder map, errors, testing, phase status):

→ **[`docs/technical-requirements.md`](./docs/technical-requirements.md)**

Product phases: [`docs/x-pi-mvp-plan.md`](./docs/x-pi-mvp-plan.md) · dependency CVE notes: [`docs/security-deps.md`](./docs/security-deps.md)

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
│   │       ├── middleware/       # JWT auth, assertOwner, auth rate limit
│   │       ├── lib/              # env, prisma, asyncHandler, AppError
│   │       └── tests/unit/       # grade, SM-2, streak, levels, rate-limit
│   ├── web/                      # React + Vite + Tailwind
│   │   └── src/
│   │       ├── pages/            # route screens
│   │       ├── features/         # auth / learn / reviews (growth)
│   │       ├── components/
│   │       │   ├── marketing/    # `/` landing only (BeeHomeHero default)
│   │       │   ├── brand/        # BeeMascot
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

### Common PowerShell one-liners (no `&&` — run line by line)

```powershell
git fetch origin
git checkout main
git pull origin main
npm install
npm run build -w @x-pi/shared
npm run dev:api
```

In a **second** terminal:

```powershell
npm run dev:web
```

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
npx prisma migrate deploy
npx prisma generate
npx tsx prisma/seed.ts
cd ../..

# 4) Run
npm run dev:api   # :4000
npm run dev:web   # :5173 (or :5174)
```

Local seed runs in development by default (`NODE_ENV` unset or `development`). It **wipes and recreates** demo data — use only on a disposable local database.

**Destructive seed reset (override):** only when you intentionally need to force a wipe outside local development (e.g. CI). Never set this against a shared or production database:

```bash
# WARNING: deletes users, courses, progress, and related rows, then reseeds
ALLOW_SEED_RESET=true npx tsx prisma/seed.ts
```

Demo user from seed:

- Email: `demo@x-pi.app`
- Password: `demo1234`

## CI

GitHub Actions (`.github/workflows/ci.yml`) installs deps, migrates Postgres, seeds, typechecks the API, and builds the web app on pushes/PRs to `main`.

## API overview

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/health` | Process liveness (no DB) |
| GET | `/ready` | Readiness — Postgres `SELECT 1` |
| POST | `/auth/register` | Create user + tokens |
| POST | `/auth/login` | Access + refresh |
| POST | `/auth/refresh` | Rotate refresh |
| POST | `/auth/logout` | Revoke refresh |
| GET | `/auth/me` | Current user |
| GET | `/lessons` | Path + lock state |
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
| `/` | Marketing — **H2 bee** homepage (`BeeHomeHero`; Spline `?home=spline`, alts `?home=1..5`, legacy `?home=legacy`) |
| `/auth` | Login / register |
| `/learn` | Duolingo-like lesson path (`LessonShell` + brand bee at current node) |
| `/learn/lesson/:id` | Lesson session |
| `/learn/reviews` | Due SRS reviews |
| `/learn/profile` | Profile / stats |

## Demo path

1. Ensure you are on **`main`** (PowerShell lines above). Start API + web — open `/` for the bee homepage, then **Öğrenmeye başla**.
2. Log in as demo user → `/learn` path → play **Greetings** (MCQ + fill-blank).
3. Finish lesson → see XP / streak / daily goal update on home + profile.
4. Mobile: light splash → login → Learn tab → lesson → Profile.
