# x-pi — Technical Requirements

Authoritative engineering spec for the **x-pi** monorepo. Aligns with [`x-pi-mvp-plan.md`](./x-pi-mvp-plan.md) and the Phase 1 implementation on branch `cursor/x-pi-learning-platform-332f`.

---

## 1. Product summary

x-pi is a gamified micro-learning platform (Duolingo-like loop, original branding). Learners authenticate, walk a locked lesson path, complete short sessions (MCQ / fill-blank in Phase 1), earn XP/hearts, maintain timezone-aware streaks and daily XP goals, and schedule reviews via modified SM-2.

| Surface | Role |
| --- | --- |
| Web `/` | Marketing / brand landing (`MarketingHero`) |
| Web `/learn/*` | Learning shell (`LessonShell`) — path, lesson, profile |
| Mobile (Expo) | Learn + lesson + profile parity against the same API |
| API | Auth, lessons, stats, SRS queue |

---

## 2. Monorepo stack

| Package | Runtime | Primary libs |
| --- | --- | --- |
| `apps/api` | Node.js ≥20 | Express 4, Prisma 6, PostgreSQL, JWT (`jsonwebtoken`), Zod, bcryptjs |
| `apps/web` | Browser | React 19, Vite 7, TypeScript, Tailwind 4, React Router 7, Zustand |
| `apps/mobile` | Expo / RN | Expo ~57, React Navigation, AsyncStorage |
| `packages/shared` | Consumed by api/web | Types, XP/level curve, SM-2, date/normalize helpers |

**Out of scope (Phase 1):** payments, social, shops, CMS, GraphQL, microservices, multi-tenant SaaS.

---

## 3. Backend requirements (`apps/api`)

### 3.1 Runtime & hosting

- Bind HTTP to `0.0.0.0:$PORT` (default `4000`).
- Single Express process; Prisma Client as the data access layer.
- Health: `GET /health` must verify DB connectivity (`SELECT 1`) and return `{ ok: true }`.

### 3.2 Environment

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes in production | Fail-closed startup if missing when `NODE_ENV=production` |
| `PORT` | No | Default `4000` |
| `CORS_ORIGIN` | No | Comma-separated origins; default web + Expo |
| `NODE_ENV` | No | `development` / `production` |
| `ALLOW_SEED_RESET` | Seed only | Must be `true` (or local dev) before destructive seed |

See `apps/api/.env.example`.

### 3.3 Auth

- Register / login with email + password (bcrypt hash cost ≥10).
- Issue signed JWT (`userId`, `email`); `Authorization: Bearer <token>` on protected routes.
- `GET /auth/me` returns public user fields (no password hash).
- Production must not fall back to a known development secret.
- IANA timezone validated on register (invalid → `UTC`).
- Registration responses must not confirm email existence beyond a generic conflict message.
- **Planned:** rate limits on `/auth/register` and `/auth/login`.

### 3.4 Data model (Prisma)

Core models (see `prisma/schema.prisma`):

- `User` — xp, level, hearts, timezone, dailyXpGoal
- `Course` / `Lesson` / `Question` — content; `QuestionType`: `MCQ` \| `FILL_BLANK` (+ Phase 2 types later)
- `LessonSession` — `IN_PROGRESS` \| `COMPLETED` \| `ABANDONED`; question order, hearts, answer log
- `UserProgress` — completed, stars, bestScore, timesCompleted
- `Streak` / `DailyActivity` — calendar-day activity in user TZ
- `XpEvent` — unique `(userId, reason, refId)` for idempotent awards
- `SrsCard` — SM-2 fields + `dueAt`, linked to `Question`

### 3.5 HTTP API

| Method | Path | Auth | Behavior |
| --- | --- | --- | --- |
| POST | `/auth/register` | No | Create user + JWT |
| POST | `/auth/login` | No | Login + JWT |
| GET | `/auth/me` | Yes | Current user |
| GET | `/lessons` | Yes | Path with lock/complete/stars |
| POST | `/lessons/:id/start` | Yes | Abandon prior in-progress for lesson; create session (atomic) |
| POST | `/lessons/sessions/:id/answer` | Yes | Grade MCQ/fill-blank; update hearts/SRS/XP on complete |
| GET | `/me/stats` | Yes | XP progress, streak summary, hearts |
| GET | `/me/queue` | Yes | Suggested lesson + due reviews |
| GET | `/me/reviews` | Yes | Due SRS cards |
| POST | `/me/reviews/:cardId/answer` | Yes | Grade review; reject if `dueAt` in future |
| GET | `/health` | No | Liveness + DB readiness |

### 3.6 Lesson engine

- Session state machine: start → answer loop → `COMPLETED` (reached end with hearts) or `ABANDONED` (hearts depleted).
- `sessionComplete === true` only for successful `COMPLETED` (not abandon).
- Concurrent answers: `SELECT … FOR UPDATE` on session row; duplicate submit for same question is idempotent.
- Concurrent starts: lock user row; abandon + create in one transaction.
- Hearts: persist to `User.hearts` on incorrect answers; new sessions read persisted hearts.
- Phase 1 types: `MCQ`, `FILL_BLANK` (normalized string compare via `@x-pi/shared`).
- **Phase 2:** `TRANSLATE`, listening, matching; mid-lesson disconnect resume (restore `IN_PROGRESS` session).

### 3.7 Gamification / progression engine

- XP awards via `XpEvent` uniqueness + atomic `xp: { increment }` and level from shared `levelFromXp`.
- Lesson complete: base reward + correctness bonuses (`XP_PER_CORRECT`, `XP_LESSON_BONUS`, `XP_PERFECT_BONUS`).
- Streaks: calendar day in user IANA TZ; consecutive days increment; gap → reset current streak; stale streak reflected when reading summary.
- Daily XP goal: `DailyActivity.xpEarned` vs `User.dailyXpGoal`.
- **Phase 2:** streak freeze / recovery.

### 3.8 SRS engine

- Modified SM-2 in `@x-pi/shared` (`scheduleSm2`, `qualityFromAnswer`).
- Lesson answers upsert/update `SrsCard`; reviews only when `dueAt <= now`.
- **Phase 2:** client review UI (API already exists); stronger idempotency on review retries.

### 3.9 Layering (target layout)

```
apps/api/src/
  index.ts              # compose app, mount routers
  routes/               # HTTP adapters (thin)
  controllers/          # optional request/response shaping (Phase 2+)
  services/             # domain orchestration (Phase 1 home of logic)
  engines/              # pure-ish progression / srs / lesson helpers (extract over time)
  middleware/           # auth, future rate-limit
  validators/           # shared Zod schemas (extract from routes)
  lib/                  # env, prisma, asyncHandler
```

Phase 1 keeps business logic in `services/*` with Zod inline in routes. New folders are scaffolded for a production-ready layout; extract without inventing fake logic.

### 3.10 Security

- Fail-closed `JWT_SECRET` in production.
- Seed reset gated by `ALLOW_SEED_RESET` / development.
- CORS allowlist via `CORS_ORIGIN`.
- Dependency overrides / `.trivyignore` documented in [`security-deps.md`](./security-deps.md).
- No secrets in git; use `.env.example` only.

### 3.11 Testing (target)

- `apps/api/src/tests/` — unit tests for engines; integration tests against Postgres for sessions/XP/SRS.
- Phase 1: CI typecheck + migrate + seed + web build (no test runner yet). Placeholders document intent.

---

## 4. Frontend requirements — Web (`apps/web`)

### 4.1 Dual UI (hard product rule)

| Route | Shell | Aesthetic |
| --- | --- | --- |
| `/` | Marketing | Brand-first hero, atmospheric motion, expressive type (Syne/Outfit). No learn chrome. |
| `/auth` | Auth | Minimal; after login → `/learn` |
| `/learn`, `/learn/lesson/:id`, `/learn/profile` | `LessonShell` | Duolingo-like green path, Nunito, clear controls. No marketing atmosphere. |

Shared brand tokens live in `src/styles/tokens.css`. Do not mix shells.

### 4.2 Features (Phase 1)

- Auth: register/login, persist JWT (Zustand + localStorage).
- Learn home: path of lessons with lock/complete/stars, top stats (XP, streak, hearts, daily goal).
- Lesson session: progress bar, MCQ options / fill-blank input, hearts, feedback, completion XP.
- Profile: stats summary.
- Guard authenticated `/learn/*` routes; redirect unauthenticated users to `/auth`.

### 4.3 Target layout

```
apps/web/src/
  pages/                # route-level screens (Phase 1)
  features/             # feature modules (auth, learn, reviews) — Phase 2 growth
  components/
    marketing/          # LandingPage, MarketingHero
    learn/              # LessonShell, future path/node widgets
    common/             # shared presentational (BottomNav, TopStats today at components/)
  hooks/                # data/UI hooks
  stores/               # Zustand stores (re-export / migrate from store.ts)
  api/ or lib/          # API client
  styles/               # tokens + global
```

### 4.4 UX / a11y baselines

- Disable overlapping answer submits (`busy` / feedback guards).
- Loading and error states on home/lesson when API fails.
- **Phase 2:** review screen, listening/matching UI, disconnect resume banner.

---

## 5. Frontend requirements — Mobile (`apps/mobile`)

### 5.1 Stack & config

- Expo app; `EXPO_PUBLIC_API_URL` for device/emulator (document Android `10.0.2.2` vs localhost).
- Light brand splash optional; learn tabs stay Duolingo-like (no heavy marketing motion).

### 5.2 Screens (Phase 1)

- Splash → Auth → Learn (home path) → Lesson → Profile (tabs + stack).
- Same API contracts as web; local token in AsyncStorage.

### 5.3 Target layout

```
apps/mobile/src/
  screens/              # Phase 1 screens
  components/           # shared RN UI
  services/             # API client (migrate from api.ts)
  navigation/           # navigators extracted from App.tsx
  types.ts              # local nav / helper types
```

### 5.4 Phase 2 mobile

- Review flow, new question types, stronger parity with web learn chrome, request timeouts.

---

## 6. Shared package (`packages/shared`)

Must remain free of Node/React/RN imports so both API and web can consume the build output.

| Area | Responsibility |
| --- | --- |
| `types` | `AuthUser`, lesson/session/SRS DTOs, question types |
| `xp` / levels | `xpForLevel`, `levelFromXp`, `xpProgressInLevel`, XP constants |
| `srs` | Modified SM-2 schedule + quality mapping |
| `dates` | Calendar day in IANA timezone |
| `normalize` | Answer string normalization for fill-blank |

Target tree:

```
packages/shared/src/
  types/
  constants/
  xp/
  srs/
  utils/          # dates, normalize
  index.ts        # public barrel
```

---

## 7. Phase status

### Phase 1 — Done (shipped in PR #1)

- [x] Monorepo api / web / mobile / shared
- [x] JWT auth + Prisma schema + seed course
- [x] Lesson engine MCQ + fill-blank
- [x] XP, levels, hearts, streaks, daily goal
- [x] Modified SM-2 cards + review API
- [x] Dual web UI (marketing vs learn)
- [x] Expo home / lesson / profile
- [x] CI: migrate, seed, typecheck API, build web
- [x] Sourcery-blocking dependency mitigations documented

### Phase 2 — Planned

- [ ] Question types: translation, listening, matching
- [ ] Mid-lesson disconnect resume
- [ ] Streak freeze / recovery
- [ ] Client review UIs (web + mobile)
- [ ] Auth rate limiting, request timeouts
- [ ] Extract engines/validators/controllers; add real tests
- [ ] Stronger mobile parity and motion polish

---

## 8. Non-functional requirements

| Concern | Requirement |
| --- | --- |
| Consistency | Shared types and XP/SRS math only from `@x-pi/shared` |
| Concurrency | Session/XP/streak updates must not lose awards under parallel requests |
| Idempotency | XP events unique by `(userId, reason, refId)` |
| Observability | Structured error logging on API; health for probes |
| Docs | README setup + this file + `security-deps.md` kept current |
| CI | Green `build` + Sourcery on PR before merge |

---

## 9. Related docs

- [`x-pi-mvp-plan.md`](./x-pi-mvp-plan.md) — product phases
- [`ide-handoff.md`](./ide-handoff.md) — local continuation
- [`security-deps.md`](./security-deps.md) — dependency CVE posture
- Root [`README.md`](../README.md) — setup, API table, **repo structure map**
