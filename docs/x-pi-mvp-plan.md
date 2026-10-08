# x-pi MVP plan

## Goal
Ship a demoable Duolingo-like learning loop (web + Expo) without burning tokens on full-product polish.

## Dual UI (web)
- **Marketing / landing (`/`):** Modern “Higgsfield-like” tech aesthetic — brand-first hero, atmospheric full-bleed motion (CSS/SVG), expressive type (Syne/Outfit). Shared tokens only; no learn chrome.
- **Learning surfaces (`/learn`, lesson, profile):** Classic fast 2D Duolingo-like green path (Nunito, clear controls). No marketing atmosphere.
- **Tokens:** `apps/web/src/styles/tokens.css` bridges brand green + type across shells.
- **Expo:** Light brand splash optional; learn tabs stay Duolingo-like (no heavy mobile motion).

## Phase 1 — Core
- Monorepo: `apps/api` (Express + Prisma + Postgres), `apps/web` (React + TS + Tailwind), `apps/mobile` (Expo)
- Auth: register/login JWT
- Schema: User, Lesson, Question, UserProgress, Streak, SrsCard
- Engines: XP + level-up, timezone-aware streaks, daily goal, modified SM-2
- Lesson types: multiple choice + fill-in-the-blank (state machine)
- Web UI: green Duolingo-like path, progress bar, bottom nav, lesson session
- Mobile: same API, home + lesson + profile screens
- Seed course + README + draft PR

## Phase 2 — After MVP works
- [x] Translation + listening/matching (`TRANSLATE` / `LISTEN` / `MATCH`)
- [x] Mid-lesson disconnect resume
- [x] Streak freeze/recovery hooks
- [x] Stronger mobile parity (lesson types, resume, freezes)
- [x] Mobile review screen + auth rate limits + automated unit tests
- [ ] Integration tests / content CMS / payments (out of Phase 2)

## Out of scope for Phase 1
- Payments, social, shops, full CMS, GraphQL, microservices
