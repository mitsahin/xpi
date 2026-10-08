import { Link } from "react-router-dom";
import { useAppStore } from "../../store";
import { MarketingHero } from "./MarketingHero";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { useHeroTheme } from "./useHeroTheme";

export function LandingPage() {
  const token = useAppStore((s) => s.token);
  const enterTo = token ? "/learn" : "/auth";
  const { themeId, theme, setThemeId } = useHeroTheme();

  return (
    <div className="min-h-full text-[var(--xpi-ink)]" style={{ background: theme.pageBg }}>
      <MarketingHero theme={theme} />
      <ThemeSwitcher themeId={themeId} onChange={setThemeId} />

      <section
        id="how"
        className="scroll-mt-8 border-t border-white/5 px-6 py-[var(--space-section)]"
        style={{
          background: `linear-gradient(180deg, ${theme.howFrom} 0%, #eef2f7 28%, #f4f6f8 100%)`,
        }}
      >
        <div className="mx-auto max-w-6xl">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--xpi-ink)] md:text-4xl">
            How x-pi works
          </h2>
          <p className="mt-3 max-w-xl text-[var(--xpi-muted)]">
            One focused loop: short lessons, clear progress, reviews when you need them.
          </p>
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              {
                n: "01",
                t: "Bite-sized lessons",
                d: "MCQ and fill-in-the-blank drills that finish in minutes.",
              },
              {
                n: "02",
                t: "Streaks & daily goals",
                d: "Timezone-aware streaks keep the habit honest.",
              },
              {
                n: "03",
                t: "Spaced reviews",
                d: "Modified SM-2 brings hard items back at the right time.",
              },
            ].map((item) => (
              <li key={item.n} className="border-t border-[var(--xpi-ink)]/10 pt-5">
                <div
                  className="font-[family-name:var(--font-display)] text-sm font-bold"
                  style={{ color: theme.ctaHover }}
                >
                  {item.n}
                </div>
                <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl font-bold text-[var(--xpi-ink)]">
                  {item.t}
                </h3>
                <p className="mt-2 text-[var(--xpi-muted)]">{item.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-[var(--xpi-ink)]/8 bg-[var(--xpi-ink)] px-6 py-16 text-[#e8f0ff]">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
              Ready when you are.
            </p>
            <p className="mt-2 text-[#a8b0ba]">Jump into the learn path — no chrome, just practice.</p>
          </div>
          <Link
            to={enterTo}
            className="inline-flex rounded-full px-7 py-3.5 font-bold text-white transition-colors"
            style={{ backgroundColor: theme.ctaBg }}
          >
            Enter x-pi
          </Link>
        </div>
      </section>
    </div>
  );
}
