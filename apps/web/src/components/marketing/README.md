# Marketing components

Landing-only UI. Used on `/` only — never inside `/learn`.

- **`SplineHomeHero`** — default `/` **Walky Talky** hero (Spline Community preview iframe; `@splinetool/react-spline` when `VITE_SPLINE_SCENE_URL` / Export → Code URL is set)
- `BeeHomeHero` — H2 bee splash; opt-in via `?home=h2`
- `DuoHomeVariants` — optional alt layouts via `?home=1`…`5`
- `HomeMascot` — green buddy used by alt variants
- `MarketingHero` — prior hero; `?home=legacy`
- Brand bee: `../brand/BeeMascot.tsx` (shared with learn path)
