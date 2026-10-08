# Middleware

- `auth.ts` — JWT require + sign
- `rateLimit.ts` — in-memory limiter; `authRateLimit` on `/auth/*` (20 / 15m / IP)
