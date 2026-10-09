Duolingo-like learning chrome (`LessonShell`). Used under `/learn/*` only — no marketing atmosphere.

- `LessonShell` — font/background wrapper for learn routes
- `LearnPath` / `LearnPathNode` — winding circular path (locked / current / completed)
- `PathMascot` — original 2D SVG buddy (not a Duolingo trademark)
- `LearnLoading` / `LearnEmptyState` / `LearnErrorState` — shared path states
- Path variants: `?path=classic` (default, spacious) or `?path=pro` (denser)
- Visual QA without API: `?demo=1` (fixture lessons + stats)
