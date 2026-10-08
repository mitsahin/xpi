import { Link } from "react-router-dom";
import { useAppStore } from "../../store";
import { MarketingHero } from "./MarketingHero";

export function LandingPage() {
  const token = useAppStore((s) => s.token);
  const enterTo = token ? "/learn" : "/auth";

  return (
    <div className="min-h-full bg-[#041612] text-[var(--xpi-ink)]">
      <MarketingHero />

      <section
        id="how"
        className="scroll-mt-8 border-t border-white/5 bg-[linear-gradient(180deg,#0a2a22_0%,#eef6ea_28%,#f4f7f4_100%)] px-6 py-[var(--space-section)]"
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
                <div className="font-[family-name:var(--font-display)] text-sm font-bold text-[var(--xpi-green-deep)]">
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

      <section className="border-t border-[var(--xpi-ink)]/8 bg-[var(--xpi-ink)] px-6 py-16 text-[#e8f5e4]">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
              Ready when you are.
            </p>
            <p className="mt-2 text-[#a8bbaa]">Jump into the learn path — no chrome, just practice.</p>
          </div>
          <Link
            to={enterTo}
            className="inline-flex rounded-full bg-[var(--xpi-green)] px-7 py-3.5 font-bold text-white hover:bg-[var(--xpi-green-deep)]"
          >
            Enter x-pi
          </Link>
        </div>
      </section>
    </div>
  );
}
