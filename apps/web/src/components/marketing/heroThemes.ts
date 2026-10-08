export type HeroThemeId = "a" | "b" | "c";

export type HeroTheme = {
  id: HeroThemeId;
  label: string;
  short: string;
  pageBg: string;
  text: string;
  textMuted: string;
  plane: string;
  bloomA: string;
  bloomB: string;
  veil: string;
  sheen: string;
  ctaBg: string;
  ctaHover: string;
  ctaShadow: string;
  glassText: string;
  orb: {
    color: string;
    emissive: string;
    glow: string;
    lightDir: string;
    lightPoint: string;
  };
  cssOrbA: string;
  cssOrbB: string;
  cssOrbC: string;
  cssOrbCore: string;
  cssOrbGlow: string;
  howFrom: string;
};

export const HERO_THEMES: Record<HeroThemeId, HeroTheme> = {
  a: {
    id: "a",
    label: "Navy · Cyan",
    short: "A",
    pageBg: "#050b18",
    text: "#e8f0ff",
    textMuted: "#9bb0d0",
    plane:
      "radial-gradient(90% 70% at 78% 42%, rgba(56,189,248,0.28) 0%, transparent 55%), radial-gradient(70% 55% at 12% 80%, rgba(30,58,138,0.5) 0%, transparent 50%), linear-gradient(165deg, #030712 0%, #0a1628 42%, #0f2744 72%, #123052 100%)",
    bloomA: "radial-gradient(circle, rgba(56,189,248,0.28) 0%, transparent 68%)",
    bloomB: "radial-gradient(circle, rgba(37,99,235,0.35) 0%, transparent 70%)",
    veil: "linear-gradient(180deg, rgba(3,7,18,0.2) 0%, transparent 35%, rgba(3,7,18,0.5) 100%)",
    sheen:
      "linear-gradient(105deg, #1e3a8a 0%, #38bdf8 38%, #a5f3fc 52%, #3b82f6 68%, #0ea5e9 100%)",
    ctaBg: "#0ea5e9",
    ctaHover: "#0284c7",
    ctaShadow: "0 12px 40px -12px rgba(14,165,233,0.55)",
    glassText: "#e8f0ff",
    orb: {
      color: "#38bdf8",
      emissive: "#0c4a6e",
      glow: "#22d3ee",
      lightDir: "#bae6fd",
      lightPoint: "#2563eb",
    },
    cssOrbA: "rgba(165,243,252,0.55)",
    cssOrbB: "rgba(56,189,248,0.5)",
    cssOrbC: "rgba(30,58,138,0.4)",
    cssOrbCore:
      "radial-gradient(circle at 35% 30%, rgba(186,230,253,0.7) 0%, transparent 40%), radial-gradient(circle at 60% 65%, #0ea5e9 0%, #0a1628 70%)",
    cssOrbGlow: "rgba(56,189,248,0.3)",
    howFrom: "#0a1628",
  },
  b: {
    id: "b",
    label: "Charcoal · Gold",
    short: "B",
    pageBg: "#0c0b0a",
    text: "#f5f0e8",
    textMuted: "#b8a99a",
    plane:
      "radial-gradient(90% 70% at 78% 42%, rgba(245,158,11,0.22) 0%, transparent 55%), radial-gradient(70% 55% at 12% 80%, rgba(68,48,24,0.55) 0%, transparent 50%), linear-gradient(165deg, #0a0908 0%, #171411 42%, #241c14 72%, #2a2118 100%)",
    bloomA: "radial-gradient(circle, rgba(251,191,36,0.22) 0%, transparent 68%)",
    bloomB: "radial-gradient(circle, rgba(180,120,40,0.32) 0%, transparent 70%)",
    veil: "linear-gradient(180deg, rgba(10,9,8,0.2) 0%, transparent 35%, rgba(10,9,8,0.55) 100%)",
    sheen:
      "linear-gradient(105deg, #78350f 0%, #f59e0b 38%, #fde68a 52%, #d97706 68%, #92400e 100%)",
    ctaBg: "#d97706",
    ctaHover: "#b45309",
    ctaShadow: "0 12px 40px -12px rgba(217,119,6,0.5)",
    glassText: "#f5f0e8",
    orb: {
      color: "#f59e0b",
      emissive: "#78350f",
      glow: "#fbbf24",
      lightDir: "#fde68a",
      lightPoint: "#b45309",
    },
    cssOrbA: "rgba(253,230,138,0.55)",
    cssOrbB: "rgba(245,158,11,0.45)",
    cssOrbC: "rgba(68,48,24,0.45)",
    cssOrbCore:
      "radial-gradient(circle at 35% 30%, rgba(254,243,199,0.7) 0%, transparent 40%), radial-gradient(circle at 60% 65%, #d97706 0%, #171411 70%)",
    cssOrbGlow: "rgba(245,158,11,0.28)",
    howFrom: "#171411",
  },
  c: {
    id: "c",
    label: "Indigo · Coral",
    short: "C",
    pageBg: "#0c0618",
    text: "#f3eef8",
    textMuted: "#b7a8c9",
    plane:
      "radial-gradient(90% 70% at 78% 42%, rgba(244,114,182,0.22) 0%, transparent 55%), radial-gradient(70% 55% at 12% 80%, rgba(76,29,149,0.5) 0%, transparent 50%), linear-gradient(165deg, #070414 0%, #14082a 42%, #1e1240 72%, #2a1850 100%)",
    bloomA: "radial-gradient(circle, rgba(167,139,250,0.28) 0%, transparent 68%)",
    bloomB: "radial-gradient(circle, rgba(244,114,182,0.3) 0%, transparent 70%)",
    veil: "linear-gradient(180deg, rgba(7,4,20,0.2) 0%, transparent 35%, rgba(7,4,20,0.55) 100%)",
    sheen:
      "linear-gradient(105deg, #4c1d95 0%, #f472b6 38%, #fbcfe8 52%, #a78bfa 68%, #7c3aed 100%)",
    ctaBg: "#ec4899",
    ctaHover: "#db2777",
    ctaShadow: "0 12px 40px -12px rgba(236,72,153,0.5)",
    glassText: "#f3eef8",
    orb: {
      color: "#f472b6",
      emissive: "#4c1d95",
      glow: "#f9a8d4",
      lightDir: "#e9d5ff",
      lightPoint: "#a78bfa",
    },
    cssOrbA: "rgba(251,207,232,0.5)",
    cssOrbB: "rgba(244,114,182,0.45)",
    cssOrbC: "rgba(76,29,149,0.45)",
    cssOrbCore:
      "radial-gradient(circle at 35% 30%, rgba(250,232,255,0.7) 0%, transparent 40%), radial-gradient(circle at 60% 65%, #ec4899 0%, #14082a 70%)",
    cssOrbGlow: "rgba(244,114,182,0.3)",
    howFrom: "#14082a",
  },
};

export const DEFAULT_HERO_THEME: HeroThemeId = "a";

export function parseHeroTheme(raw: string | null | undefined): HeroThemeId {
  const v = (raw ?? "").toLowerCase().trim();
  if (v === "a" || v === "navy" || v === "cyan") return "a";
  if (v === "b" || v === "charcoal" || v === "gold" || v === "amber") return "b";
  if (v === "c" || v === "indigo" || v === "coral" || v === "magenta") return "c";
  return DEFAULT_HERO_THEME;
}
