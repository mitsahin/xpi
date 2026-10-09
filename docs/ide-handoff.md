# Walky Talky — IDE handoff

Continue locally in Cursor with this context.

## Repo / branch
- Repo: https://github.com/mitsahin/walky-talky
- PR: https://github.com/mitsahin/walky-talky/pull/1
- Branch: `cursor/walky-talky-learning-platform-332f`

## Stack
Monorepo: `apps/api` (Express + Prisma + Postgres), `apps/web` (React + Vite + Tailwind), `apps/mobile` (Expo), `packages/shared`.

## Product so far
- Gamified learning: XP, streaks (timezone), daily goals, SM-2 SRS
- Lesson types Phase 1: MCQ + fill-blank
- Dual UI: `/` = MarketingHero (modern tech); `/learn` + lesson/quiz = Duolingo-like LessonShell
- Demo: `demo@walky-talky.app` / `demo1234`

## Plan
See [Walky Talky MVP plan](./walky-talky-mvp-plan.md) and full [technical requirements](./technical-requirements.md) (stack, APIs, engines, dual UI, Phase 1/2). Phase 2 still open: translation, listening/matching, disconnect resume, streak freeze, stronger mobile.

## Preference
IDE/local for UI iteration; cloud only for large scaffold/CI/PR-wide work.

## Local commands
```bash
git fetch origin && git checkout cursor/walky-talky-learning-platform-332f
npm install
npm run build -w @walky-talky/shared
# API (optional for full lesson flow):
cp apps/api/.env.example apps/api/.env   # set DATABASE_URL
cd apps/api && npx prisma migrate deploy && npx prisma generate
ALLOW_SEED_RESET=true npx tsx prisma/seed.ts && cd ../..
npm run dev:api    # :4000
npm run dev:web    # :5173
```

## Paste into local Cursor chat
```
Walky Talky monorepo on branch cursor/walky-talky-learning-platform-332f (PR #1).
Dual UI is in: MarketingHero on `/`, LessonShell on `/learn`.
Continue Phase 2 from docs in Context if available, else: translation + listening/matching, mid-lesson disconnect resume, streak freeze/recovery, mobile parity.
Keep Duolingo-like learn UI; don’t put marketing chrome in lessons.
Prefer small local commits; don’t overbuild.
```
