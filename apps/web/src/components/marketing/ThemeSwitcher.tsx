import { HERO_THEMES, type HeroThemeId } from "./heroThemes";

type ThemeSwitcherProps = {
  themeId: HeroThemeId;
  onChange: (id: HeroThemeId) => void;
};

/** Preview-only control on the marketing landing — not for learn/lesson. */
export function ThemeSwitcher({ themeId, onChange }: ThemeSwitcherProps) {
  const ids = Object.keys(HERO_THEMES) as HeroThemeId[];

  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2"
      data-testid="hero-theme-switcher"
    >
      <p className="rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/70 backdrop-blur-md">
        Preview themes
      </p>
      <div className="flex overflow-hidden rounded-full border border-white/20 bg-black/45 p-1 shadow-lg backdrop-blur-md">
        {ids.map((id) => {
          const t = HERO_THEMES[id];
          const active = id === themeId;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={active}
              title={t.label}
              onClick={() => onChange(id)}
              className={
                active
                  ? "rounded-full bg-white/20 px-3.5 py-1.5 text-xs font-bold text-white"
                  : "rounded-full px-3.5 py-1.5 text-xs font-semibold text-white/65 transition hover:text-white"
              }
            >
              {t.short}
              <span className="ml-1.5 hidden sm:inline font-medium opacity-80">{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
