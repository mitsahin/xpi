# Marketing components

Landing-only UI on `/` — never inside `/learn` / LessonShell.

| Module | Role |
| --- | --- |
| `LandingPage` | Hero + how-it-works + footer CTA + preview ThemeSwitcher |
| `MarketingHero` | Full-bleed cinematic first viewport |
| `HeroVisual` | Chooses R3F vs CSS orb (keeps three.js off mobile path) |
| `HeroScene` | Themed lightweight R3F orb |
| `HeroCtas` | Auth-aware start CTA + smooth-scroll “Nasıl Çalışır” |
| `heroThemes` / `useHeroTheme` | Themes A/B/C via `?theme=` |
| `ThemeSwitcher` | Preview-only A/B/C control (landing) |
| `usePrefersReducedMotion` / `useIsNarrow` | Performance / a11y helpers |

## Preview themes

- **A** — deep navy + electric cyan (`?theme=a`) — default
- **B** — charcoal + warm gold/amber (`?theme=b`)
- **C** — midnight indigo + soft coral/magenta (`?theme=c`)

Toggle with the floating “Preview themes” control or the query param.
