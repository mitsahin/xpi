import { Link } from "react-router-dom";

/**
 * First-viewport marketing composition: brand-first, full-bleed atmosphere,
 * one headline + support + CTAs. No cards / stats / clutter in the hero.
 */
export function MarketingHero() {
  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden">
      {/* Full-bleed atmospheric plane */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-[radial-gradient(120%_80%_at_10%_-10%,#c8f59a_0%,transparent_55%),radial-gradient(90%_70%_at_90%_10%,#8fd6c4_0%,transparent_50%),linear-gradient(165deg,#eef6ea_0%,#f7faf6_45%,#e3efe0_100%)]"
      />
      <svg
        aria-hidden
        className="mkt-drift pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-70"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="fluidA" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#58cc02" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#1a3d24" stopOpacity="0.08" />
          </linearGradient>
          <linearGradient id="fluidB" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2f6b3a" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#58cc02" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <path
          fill="url(#fluidA)"
          d="M0,180 C220,40 420,320 680,220 C940,120 1120,40 1440,160 L1440,0 L0,0 Z"
        />
        <path
          fill="url(#fluidB)"
          d="M0,900 C280,720 520,820 780,700 C1040,580 1240,760 1440,640 L1440,900 Z"
        />
        <circle cx="1180" cy="220" r="180" fill="#58cc02" fillOpacity="0.12" />
        <circle cx="180" cy="640" r="220" fill="#0f1712" fillOpacity="0.06" />
      </svg>

      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 pt-6">
        <span className="font-[family-name:var(--font-display)] text-xl font-extrabold tracking-tight text-[var(--walky-talky-ink)]">
          Walky Talky
        </span>
        <Link
          to="/auth"
          className="text-sm font-semibold text-[var(--walky-talky-ink)]/70 transition hover:text-[var(--walky-talky-ink)]"
        >
          Sign in
        </Link>
      </header>

      <div className="mx-auto flex min-h-[calc(100svh-5rem)] max-w-6xl flex-col justify-center px-6 pb-16 pt-10">
        <p className="mkt-rise font-[family-name:var(--font-display)] text-[clamp(4.5rem,14vw,9.5rem)] font-extrabold leading-[0.9] tracking-[-0.04em]">
          <span className="mkt-brand-sheen">Walky Talky</span>
        </p>
        <h1 className="mkt-rise-delay mt-6 max-w-2xl font-[family-name:var(--font-display)] text-[clamp(1.75rem,4vw,3rem)] font-bold leading-[1.1] tracking-tight text-[var(--walky-talky-ink)]">
          Micro-lessons that move with you.
        </h1>
        <p className="mkt-rise-delay-2 mt-4 max-w-md text-lg font-medium leading-relaxed text-[var(--walky-talky-muted)]">
          Streaks, XP, and spaced practice — built for daily momentum, not marathon study.
        </p>
        <div className="mkt-rise-delay-2 mt-8 flex flex-wrap items-center gap-3">
          <Link
            to="/auth"
            className="inline-flex items-center justify-center rounded-full bg-[var(--walky-talky-green)] px-7 py-3.5 text-base font-bold text-white transition hover:bg-[var(--walky-talky-green-deep)]"
          >
            Start learning
          </Link>
          <a
            href="#how"
            className="inline-flex items-center justify-center rounded-full border border-[var(--walky-talky-ink)]/15 bg-white/50 px-7 py-3.5 text-base font-semibold text-[var(--walky-talky-ink)] backdrop-blur transition hover:border-[var(--walky-talky-ink)]/30"
          >
            How it works
          </a>
        </div>
      </div>
    </section>
  );
}
