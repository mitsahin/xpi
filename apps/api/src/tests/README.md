# Tests

- `unit/` — engines and pure helpers (no DB).
- `integration/` — Prisma + HTTP against Postgres (CI service).

Phase 1 CI typechecks and seeds; add a runner (e.g. Vitest) when first real tests land. Do not add fake passing tests.
