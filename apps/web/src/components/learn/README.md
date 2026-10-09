Duolingo-like learning chrome (`LessonShell`). Used under `/learn/*` only — no marketing atmosphere.

- `LessonShell` — font/background wrapper for learn routes
- `LearnPath` / `LearnPathNode` — winding circular path (locked / current / completed)
- Bee beside current node via shared `BeeMascotMini` (brand bee, not Duo owl)
- `LearnLoading` / `LearnEmptyState` / `LearnErrorState` — shared path states
- Path variants: `?path=classic` (default, spacious) or `?path=pro` (denser)
- Visual QA without API: `?demo=1` (fixture lessons + stats)
