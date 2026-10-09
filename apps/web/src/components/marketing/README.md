# Marketing components

Landing-only UI. Used on `/` only — never inside `/learn`.

- **`BeeHomeHero`** — default `/` hero (H2 centered bee + hover)
- **`SplineHomeHero`** — opt-in via `?home=spline` (Spline Community preview iframe; `@splinetool/react-spline` when `VITE_SPLINE_SCENE_URL` is set)
- `DuoHomeVariants` — optional alt layouts via `?home=1`…`5`
- `HomeMascot` — green buddy used by alt variants
- `MarketingHero` — prior hero; `?home=legacy`
- Brand bee: `../brand/BeeMascot.tsx` (shared with learn path)
