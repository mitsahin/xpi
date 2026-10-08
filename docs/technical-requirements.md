# x-pi — Technical Requirements

Authoritative production engineering spec for the **x-pi** monorepo. Aligns with [`x-pi-mvp-plan.md`](./x-pi-mvp-plan.md). Implementation lives on branch `cursor/x-pi-learning-platform-332f` (PR [#1](https://github.com/mitsahin/xpi/pull/1)).

---

## 1. Product summary

x-pi is a gamified micro-learning platform (Duolingo-like loop, original branding). Learners authenticate, walk a locked lesson path, complete short sessions, earn XP/hearts, maintain timezone-aware streaks (with freeze), meet daily XP goals, and schedule reviews via modified SM-2.

| Surface | Role |
| --- | --- |
| Web `/` | Marketing / brand landing (`MarketingHero`) |
| Web `/learn/*` | Learning shell (`LessonShell`) — path, lesson, reviews, profile |
| Mobile (Expo) | Learn + lesson + reviews + profile against the same API |
| API | Auth, lessons, stats, SRS queue |

**Out of scope (current phases):** payments, social graph, shops, CMS, GraphQL, microservices, multi-tenant SaaS, OAuth providers, refresh-token rotation (planned).

---

## 2. Monorepo stack

| Package | Runtime | Primary libs |
| --- | --- | --- |
| `apps/api` | Node.js ≥20 | Express 4, Prisma 6, PostgreSQL, JWT (`jsonwebtoken`), Zod, bcryptjs, helmet, cors |
| `apps/web` | Browser | React 19, Vite 7, TypeScript, Tailwind 4, React Router 7, Zustand |
| `apps/mobile` | Expo / RN | Expo ~57, React Navigation, AsyncStorage |
| `packages/shared` | Consumed by api/web | Types, XP/level curve, SM-2, date/normalize/grade helpers |

Workspaces: npm workspaces at repo root. CI: `.github/workflows/ci.yml` (Postgres service, migrate, seed, API typecheck + unit tests, web build).

---

## 3. File / folder map (directory algorithm)

Every package has a single responsibility. Empty folders hold `README.md` stubs — not fake business logic.

```
xpi/
├── apps/
│   ├── api/
│   │   ├── prisma/                 # schema.prisma, migrations/, seed.ts (+ seed modules)
│   │   └── src/
│   │       ├── index.ts            # compose Express app, helmet/cors/json, routers, error middleware
│   │       ├── routes/             # thin HTTP adapters (auth, lessons, me)
│   │       ├── services/           # domain orchestration + transactions
│   │       ├── engines/            # pure-ish lesson grade/payload + progression/streak
│   │       │   ├── lesson/         # gradeLessonAnswer, toQuestionPayload, shuffle
│   │       │   ├── progression/    # streakLogic, applyStreakActivity, freeze award
│   │       │   └── srs/            # reserved; SM-2 math stays in @x-pi/shared
│   │       ├── controllers/        # reserved (request/response shaping)
│   │       ├── validators/         # Zod schemas (ids, auth, answer bodies)
│   │       ├── middleware/         # requireAuth, assertOwner, authRateLimit
│   │       ├── lib/                # env, prisma, asyncHandler, AppError
│   │       └── tests/unit/         # grade, SM-2, streak, levels, rate-limit
│   ├── web/src/
│   │   ├── pages/                  # Auth, Home, Lesson, Reviews, Profile
│   │   ├── features/learn/         # MatchBoard, questionLabels
│   │   ├── components/
│   │   │   ├── marketing/          # LandingPage, MarketingHero (route `/` only)
│   │   │   ├── learn/              # LessonShell
│   │   │   └── common/             # BottomNav, TopStats (presentational)
│   │   ├── stores/ · store.ts      # Zustand + localStorage JWT
│   │   ├── lib/api.ts · api/       # API client (Bearer token)
│   │   └── styles/tokens.css       # brand tokens shared across shells
│   └── mobile/src/
│       ├── screens/                # Splash, Auth, Home, Lesson, Reviews, Profile
│       ├── services/api.ts         # API client + timeouts
│       ├── components/             # shared RN UI
│       └── navigation/             # extract target from App.tsx
├── packages/shared/src/
│   ├── types/                      # AuthUser, DTOs, QuestionType
│   ├── constants/                  # hearts / XP defaults re-exports
│   ├── xp/                         # xpForLevel, levelFromXp, xpProgressInLevel
│   ├── srs/                        # scheduleSm2, qualityFromAnswer, newSm2Card
│   └── utils/                      # calendarDateInTz, normalize, gradeQuestionAnswer
├── scripts/                        # e.g. dev-api.ps1 (Windows API+Postgres bootstrap)
└── docs/                           # this file, mvp plan, security-deps, ide-handoff
```

### Responsibility rules

| Layer | May | Must not |
| --- | --- | --- |
| `routes/*` | Parse Zod, call services, map status | Own business rules or Prisma writes |
| `services/*` | Transactions, ownership checks, orchestrate engines | Depend on Express `req`/`res` |
| `engines/*` | Pure transforms / streak math | Hit Prisma (except thin wrappers already in progression) |
| `validators/*` | Zod only | Side effects |
| `middleware/*` | AuthN, rate limit, AuthZ helpers | Domain scoring |
| `@x-pi/shared` | Portable math/types | Node/React/RN imports |

---

## 4. Backend requirements (`apps/api`)

### 4.1 Runtime & hosting

- Bind HTTP to `0.0.0.0:$PORT` (default `4000`) — Render/container friendly.
- Single Express process; Prisma Client as the sole data access layer.
- `app.set("trust proxy", 1)` so rate-limit keys honor `X-Forwarded-For`.
- Health: `GET /health` runs `SELECT 1` and returns `{ ok: true, service: "x-pi-api" }`.
- Ephemeral filesystem: no durable local writes beyond process memory (rate-limit buckets are in-memory).

### 4.2 Environment

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes in production | Fail-closed if missing; must be ≥32 chars and not the example value |
| `JWT_EXPIRES_IN` | No | Access-token lifetime for `jsonwebtoken` (default `7d`) |
| `PORT` | No | Default `4000` |
| `CORS_ORIGIN` | No | Comma-separated allowlist; default `http://localhost:5173,http://localhost:5174` |
| `JSON_BODY_LIMIT` | No | `express.json` limit (default `32kb`) |
| `NODE_ENV` | No | `development` / `production` |
| `ALLOW_SEED_RESET` | Seed only | Must be `true` (or local development) before destructive seed |

See `apps/api/.env.example`. Never commit real secrets.

### 4.3 Modules (wired)

| Module | Path | Status |
| --- | --- | --- |
| Lesson engine | `engines/lesson` | Wired — grade, payload, shuffle |
| Progression / streak | `engines/progression` | Wired — freeze consume/award, effective streak |
| SRS math | `@x-pi/shared` `srs/` | Wired via `services/srs` |
| Auth middleware | `middleware/auth` | Wired — `requireAuth`, `signToken`, `assertOwner` |
| Rate limit | `middleware/rateLimit` | Wired — 20 / 15m on `/auth/*` |
| Validators | `validators/{ids,auth}` | Wired on auth, lessons, me routes |
| Errors | `lib/errors` `AppError` | Wired — global error middleware |

---

## 5. Authentication (AuthN)

### 5.1 Flows

| Endpoint | Body (Zod) | Behavior |
| --- | --- | --- |
| `POST /auth/register` | email, password (≥6), displayName (≤40), optional timezone | bcrypt hash cost **10**; create `User` + empty `Streak`; issue JWT; `201` |
| `POST /auth/login` | email, password | Compare hash; issue JWT; generic `401 Invalid credentials` on failure |
| `GET /auth/me` | — (Bearer) | Public user fields only (no `passwordHash`) |

### 5.2 JWT strategy (current)

- **Access tokens only** (no refresh token issued yet).
- Claims: `{ userId, email }` signed with `HS256` via `jsonwebtoken`.
- Lifetime: `JWT_EXPIRES_IN` (default `7d`). Clients store the token (web: Zustand + `localStorage`; mobile: AsyncStorage) and send `Authorization: Bearer <token>`.
- Verification: `requireAuth` rejects missing/malformed/expired tokens with `401` + `code: AUTH_REQUIRED | AUTH_INVALID`.
- **Planned:** refresh + short-lived access tokens, token revocation / rotation, optional email verification.

### 5.3 Password hashing

- Algorithm: **bcrypt** (`bcryptjs`), cost factor **10**.
- Passwords never logged or returned. Max length capped in Zod (128) to bound hashing cost.

### 5.4 JWT_SECRET rules

| Environment | Rule |
| --- | --- |
| `production` | Must be set; length ≥ 32; must not equal `change-me-in-production`. Process exits on boot otherwise. |
| `development` | Falls back to `x-pi-dev-secret` if unset (local only). |

### 5.5 Privacy on register

- Email stored lowercased.
- Conflict response: generic `"Unable to register with these credentials"` (`409`) — does not confirm which field collided.
- Invalid IANA timezone → coerced to `UTC`.

### 5.6 Rate limiting (auth)

- In-memory sliding window: **20 requests / 15 minutes / IP** on all `/auth/*` routes (`authRateLimit`).
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.
- Over limit → `429` with a generic message.
- Multi-instance note: buckets are per-process; for horizontal scale, replace with Redis (planned).

---

## 6. Authorization (AuthZ)

### 6.1 Authenticated routes

All of the following require `requireAuth` (valid JWT):

- `GET /auth/me`
- `GET /lessons`, `GET /lessons/:lessonId/active`, `POST /lessons/:lessonId/start`
- `POST /lessons/sessions/:sessionId/answer`
- `GET /me/stats`, `GET /me/queue`, `GET /me/reviews`
- `POST /me/reviews/:cardId/answer`

Public: `GET /health`, `POST /auth/register`, `POST /auth/login`.

### 6.2 Ownership checks

| Resource | Check |
| --- | --- |
| `LessonSession` | Queries scoped `where: { id, userId }`; `assertOwner(session.userId, authUserId)` |
| `SrsCard` | Queries scoped `where: { id, userId }` + row `FOR UPDATE`; `assertOwner` |
| `UserProgress` / stats / queue | Always filtered by `req.auth.userId` |
| Lesson path lock | Server-side: cannot start locked lessons (`403 LESSON_LOCKED`) |

`assertOwner` returns **404** with code `NOT_FOUND` (not 403) to avoid resource enumeration.

Clients must never trust client-supplied `userId` for writes — the API derives identity solely from the JWT.

---

## 7. Security

### 7.1 Transport & headers

- **helmet** enabled (API defaults). CSP disabled (JSON API); `crossOriginResourcePolicy: cross-origin` so browser clients on other origins can consume responses alongside CORS.
- **CORS** allowlist from `CORS_ORIGIN` (credentials allowed for configured origins only).
- **JSON body limit** default `32kb` (`JSON_BODY_LIMIT`).
- Trust proxy for correct client IP behind reverse proxies.

### 7.2 Input validation

- All mutating bodies and path ids validated with **Zod** (`validators/`).
- Id pattern: `[a-zA-Z0-9_-]{8,64}` (cuid / cuid2 / uuid-friendly).
- Answer payloads: bounded unions (string ≤500, arrays ≤50, etc.); `responseMs` ≤ 1h.

### 7.3 Seed safeguards

- Destructive seed reset refused unless `ALLOW_SEED_RESET=true` or `NODE_ENV=development`.
- Demo credentials documented in README only for local/demo — change before any shared deploy.

### 7.4 Secrets & dependencies

- No secrets in git; `.env` gitignored; `.env.example` only.
- Dependency CVE posture / overrides / `.trivyignore`: [`security-deps.md`](./security-deps.md).
- Prefer `npm audit` / CI Sourcery clearance before merge.

### 7.5 Additional posture

| Control | Status |
| --- | --- |
| HTTPS termination | Expected at reverse proxy / platform |
| SQL injection | Mitigated by Prisma parameterized queries + limited `$queryRaw` with bound params |
| XSS | API returns JSON; web uses React escaping |
| CSRF | Bearer tokens (not cookie session) — CSRF surface low |
| Refresh tokens / logout denylist | Planned |
| Distributed rate limit | Planned (Redis) |

---

## 8. Data model (Prisma)

Authoritative schema: `apps/api/prisma/schema.prisma`.

| Model | Purpose |
| --- | --- |
| `User` | email, passwordHash, displayName, timezone, xp, level, hearts, dailyXpGoal |
| `Course` / `Lesson` / `Question` | Content tree; `QuestionType`: `MCQ` \| `FILL_BLANK` \| `TRANSLATE` \| `LISTEN` \| `MATCH` |
| `LessonSession` | `IN_PROGRESS` \| `COMPLETED` \| `ABANDONED`; question order, hearts, answersJson |
| `UserProgress` | completed, stars, bestScore, timesCompleted |
| `Streak` | current/longest, lastActiveDate, freezesAvailable / freezesUsed |
| `DailyActivity` | per calendar-day XP, lessons, reviews, goalMet |
| `XpEvent` | unique `(userId, reason, refId)` for idempotent awards |
| `SrsCard` | SM-2 fields + `dueAt`, unique `(userId, questionId)` |

---

## 9. REST API surface

| Method | Path | Auth | Behavior |
| --- | --- | --- | --- |
| GET | `/health` | No | Liveness + DB readiness |
| POST | `/auth/register` | No (+ rate limit) | Create user + JWT |
| POST | `/auth/login` | No (+ rate limit) | Login + JWT |
| GET | `/auth/me` | Yes | Current public user |
| GET | `/lessons` | Yes | Path with lock / complete / stars |
| GET | `/lessons/:lessonId/active` | Yes | In-progress session for resume probe |
| POST | `/lessons/:lessonId/start` | Yes | Resume unless `forceNew`; else abandon + create (atomic) |
| POST | `/lessons/sessions/:sessionId/answer` | Yes | Grade; update hearts / SRS / XP on complete |
| GET | `/me/stats` | Yes | XP progress, streak (+ freezes), hearts, daily goal |
| GET | `/me/queue` | Yes | Suggested lesson + due review count |
| GET | `/me/reviews` | Yes | Due SRS cards (`dueAt <= now`) |
| POST | `/me/reviews/:cardId/answer` | Yes | Grade review; reject if not due |

### Error model

JSON shape:

```json
{ "error": "Human message", "code": "MACHINE_CODE" }
```

| Code | Typical status | Meaning |
| --- | --- | --- |
| `AUTH_REQUIRED` / `AUTH_INVALID` | 401 | Missing or bad JWT |
| `BAD_BODY` / `BAD_PARAMS` | 400 | Zod validation failed |
| `NOT_FOUND` | 404 | Missing or not owned |
| `LESSON_LOCKED` | 403 | Path gate |
| `SESSION_INACTIVE` | 400 | Answer on completed/abandoned session |
| `QUESTION_MISMATCH` | 409 | Wrong `questionId` for current index |
| `NOT_DUE` | 400 | SRS card not yet due |
| `EMPTY_LESSON` | 400 | No questions |
| `INTERNAL` | 500 | Unexpected (logged server-side) |

`AppError` and errors with numeric `status` are returned as JSON; unknown errors log to `console.error` and return generic 500.

---

## 10. Algorithms

### 10.1 XP & level

Defined in `packages/shared` (`xp/levels.ts`):

- `xpForLevel(n)` = `0` for n≤1; else `round(50 * (n-1)^1.5)`.
- `levelFromXp(xp)` walks the curve (cap level 200).
- Lesson complete awards: per-correct (`XP_PER_CORRECT` = 10) + lesson bonus (`XP_LESSON_BONUS` = 20) + perfect bonus (`XP_PERFECT_BONUS` = 15) when applicable, plus lesson `xpReward` as configured.
- Idempotency: `INSERT … ON CONFLICT (userId, reason, refId) DO NOTHING` then atomic `xp: { increment }`; recompute `level` from `levelFromXp`.

### 10.2 Timezone streaks + freeze

- Calendar day = `calendarDateInTz(now, user.timezone)` (`YYYY-MM-DD`).
- Pure transition: `resolveStreakTransition` in `engines/progression/streakLogic.ts`:
  - Same day → unchanged.
  - Yesterday → `currentStreak + 1`.
  - Gap of exactly **2 days** and `freezesAvailable > 0` → bridge gap, consume 1 freeze, keep streak.
  - Else → reset to `1`.
- Display: `effectiveCurrentStreak` returns `0` if gap ≥3, or gap=2 with no freezes.
- Freeze bank: cap **2**; award +1 when daily XP goal first met (`maybeAwardStreakFreeze`), idempotent per day via XP/event gating in progression service.
- Streak row locked with `SELECT … FOR UPDATE` during updates.

### 10.3 Daily goals

- `User.dailyXpGoal` (default 50).
- `DailyActivity.xpEarned` accumulates awards for `date` in user TZ.
- `goalMet` set when cumulative XP for the day ≥ goal (triggers freeze award path).

### 10.4 Modified SM-2 SRS

`packages/shared` `scheduleSm2` / `qualityFromAnswer`:

- Quality 0–5 from correctness + optional `responseMs` (&lt;2.5s → 5, &lt;6s → 4, else 3; incorrect → 1).
- Fail (q&lt;3): lapse++, repetitions=0, interval=1 day, state `RELEARNING`, ease −0.2 (floor 1.3).
- Pass: update ease (SM-2 formula, floor 1.3); intervals 1 → 3 → `round(interval * ease)`.
- `dueAt` = now + intervalDays at **09:00 UTC**.
- Lesson answers upsert `SrsCard`; review answers only when `dueAt <= now`.

### 10.5 Lesson state machine

```
                    forceNew / hearts=0
   [none] ──start──► IN_PROGRESS ──answer*──► COMPLETED
                         │                      (sessionComplete=true)
                         └── hearts depleted ──► ABANDONED
```

- Start without `forceNew`: resume existing `IN_PROGRESS` for that lesson if present.
- Start with `forceNew`: abandon prior in-progress, create new (user row `FOR UPDATE`).
- Answers: session row `FOR UPDATE`; duplicate submit for same question is idempotent; wrong `questionId` → 409.
- Hearts persist to `User.hearts` on incorrect answers; new sessions read persisted hearts.
- Types graded via `@x-pi/shared` `gradeQuestionAnswer` (MCQ, FILL_BLANK, TRANSLATE, LISTEN, MATCH).

### 10.6 Resume

- `GET /lessons/:id/active` → current in-progress session payload (or null).
- Clients (web/mobile) probe on lesson entry; offer continue vs restart (`forceNew: true`).

---

## 11. Frontend — Web (`apps/web`)

### 11.1 Dual UI (hard product rule)

| Route | Shell | Aesthetic |
| --- | --- | --- |
| `/` | Marketing | Brand-first hero, atmospheric motion, expressive type. No learn chrome. |
| `/auth` | Auth | Minimal; after login → `/learn` |
| `/learn`, `/learn/lesson/:id`, `/learn/reviews`, `/learn/profile` | `LessonShell` | Duolingo-like green path, clear controls. No marketing atmosphere. |

Shared brand tokens: `src/styles/tokens.css`. Do not mix shells.

### 11.2 State & env

- Zustand store (`store.ts` / `stores/`): `token`, `user`, login/logout; JWT in `localStorage`.
- API client: `lib/api.ts` — Vite proxy `/api` → `:4000` in dev; `Authorization` header from store.
- Env: Vite defaults; API base via proxy (no public secret keys in the browser).

### 11.3 Features

- Auth register/login; guard `/learn/*` (`Guard` → `/auth` if no token).
- Learn home: path lock/complete/stars, TopStats (XP, streak, hearts, daily goal), due-review affordance.
- Lesson: progress, all Phase-2 question UIs, hearts, feedback, completion XP, resume/restart.
- Reviews: due queue UI at `/learn/reviews`.
- Profile: stats summary.

### 11.4 UX baselines

- Disable overlapping answer submits (`busy` / feedback guards).
- Loading and error states when API fails.
- Motion reserved for marketing presence; learn UI stays clear and fast.

---

## 12. Frontend — Mobile (`apps/mobile`)

### 12.1 Stack & config

- Expo app; `EXPO_PUBLIC_API_URL` for device/emulator.
- Android emulator: use `10.0.2.2` instead of `localhost` when targeting host machine.
- Request timeouts in API client; token in AsyncStorage.

### 12.2 Screens

Splash → Auth → Learn (path) → Lesson → Reviews tab → Profile.

Parity with web learn contracts (types, resume/`forceNew`, freezes, reviews). Light splash only — no heavy marketing motion on learn tabs.

---

## 13. Shared package (`packages/shared`)

Must remain free of Node/React/RN imports.

| Area | Responsibility |
| --- | --- |
| `types` | `AuthUser`, lesson/session/SRS DTOs, `QuestionType` |
| `xp` | Level curve + XP constants |
| `srs` | Modified SM-2 |
| `utils/dates` | Calendar day in IANA TZ, day gaps |
| `utils/normalize` | Fill-blank / translate normalization |
| `utils/grade` | Cross-type answer grading |

---

## 14. Logging & observability

| Signal | Requirement |
| --- | --- |
| Unexpected errors | `console.error` in global middleware; client gets generic 500 |
| Health | `/health` for probes (DB `SELECT 1`) |
| Rate limit | Standard `X-RateLimit-*` headers |
| Structured logging / APM | Planned (JSON logs, request ids) |
| Metrics | Planned (auth failures, lesson completes, review latency) |

---

## 15. Testing expectations

| Layer | Expectation | Status |
| --- | --- | --- |
| Unit | `npm test -w @x-pi/api` — grade, SM-2, streakLogic, levels, rateLimit | Done (CI) |
| Typecheck | `npm run typecheck -w @x-pi/api` | Done (CI) |
| Seed/migrate | Prisma migrate deploy + seed in CI | Done |
| Web build | `npm run build -w @x-pi/web` | Done (CI) |
| Integration | Session/XP/SRS against Postgres | Planned |
| E2E | Playwright learn path | Planned |

New algorithm changes must add/extend unit tests under `apps/api/src/tests/unit/`.

---

## 16. Phase status

### Phase 1 — Done

- [x] Monorepo api / web / mobile / shared
- [x] JWT auth + Prisma schema + seed course
- [x] Lesson engine MCQ + fill-blank
- [x] XP, levels, hearts, streaks, daily goal
- [x] Modified SM-2 cards + review API
- [x] Dual web UI (marketing vs learn)
- [x] Expo home / lesson / profile
- [x] CI: migrate, seed, typecheck API, build web
- [x] Dependency mitigations documented

### Phase 2 — Done / on branch

- [x] Question types: `TRANSLATE`, `LISTEN`, `MATCH`
- [x] Mid-lesson disconnect resume (`GET …/active`, `forceNew`)
- [x] Streak freeze (consume 1-day gap; award on daily goal; cap 2)
- [x] Web + mobile review UI
- [x] Engines wired (`engines/lesson`, `engines/progression`)
- [x] Auth rate limiting (20 / 15m)
- [x] Unit tests in CI
- [x] Security hardening: helmet, JWT strength/expiry, Zod validators module, `AppError`, ownership `assertOwner`
- [x] Windows `scripts/dev-api.ps1` bootstrap

### Planned (later)

- [ ] Refresh tokens + short-lived access tokens
- [ ] Redis-backed rate limiting
- [ ] Structured request logging / request ids
- [ ] Postgres integration tests for sessions
- [ ] OAuth / magic-link (if product asks)
- [ ] Hearts regeneration schedule
- [ ] Controllers layer extraction (optional)

---

## 17. Non-functional requirements

| Concern | Requirement |
| --- | --- |
| Consistency | XP/SRS/grade math only from `@x-pi/shared` |
| Concurrency | Session / streak / card rows use `FOR UPDATE`; XP idempotent |
| Idempotency | `XpEvent(userId, reason, refId)` unique |
| Security | Fail-closed secrets, helmet, CORS allowlist, Zod, ownership 404 |
| Docs | README + this file + `security-deps.md` kept current |
| CI | Green `build` (+ Sourcery) on PR before merge |

---

## 18. Related docs

- [`x-pi-mvp-plan.md`](./x-pi-mvp-plan.md) — product phases
- [`ide-handoff.md`](./ide-handoff.md) — local continuation
- [`security-deps.md`](./security-deps.md) — dependency CVE posture
- Root [`README.md`](../README.md) — setup, API table, structure map, **Technical requirements** link
