import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  DEFAULT_HERO_THEME,
  HERO_THEMES,
  parseHeroTheme,
  type HeroTheme,
  type HeroThemeId,
} from "./heroThemes";

/**
 * Landing preview theme via `?theme=a|b|c` (also navy/cyan, charcoal/gold, slate/sky).
 * Default: A (navy · cyan) — not green.
 */
export function useHeroTheme(): {
  themeId: HeroThemeId;
  theme: HeroTheme;
  setThemeId: (id: HeroThemeId) => void;
} {
  const [params, setParams] = useSearchParams();
  const themeId = useMemo(
    () => parseHeroTheme(params.get("theme") ?? DEFAULT_HERO_THEME),
    [params],
  );
  const theme = HERO_THEMES[themeId];

  const setThemeId = useCallback(
    (id: HeroThemeId) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set("theme", id);
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  return { themeId, theme, setThemeId };
}
