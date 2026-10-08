# Integration tests

Runs when `DATABASE_URL` is set (CI always has Postgres).

- `refreshTokens.test.ts` — issue / rotate / reuse revoke
- Planned: session concurrency, XP idempotency, streak TZ edges, SRS due gates
