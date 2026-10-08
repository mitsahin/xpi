import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { HeroCtas } from "./HeroCtas";
import { HeroVisual } from "./HeroVisual";

const rise = (delay: number, reduced: boolean | null) =>
  reduced
    ? { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 } }
    : {
        initial: { opacity: 0, y: 22 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] as const, delay },
      };

/**
 * First-viewport marketing composition: brand-first, full-bleed cinematic plane,
 * one headline + support + CTAs + dominant 3D visual. No cards / stats / clutter.
 */
export function MarketingHero() {
  const reduced = useReducedMotion();

  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden text-[#e8f5e4]">
      {/* Full-bleed atmospheric plane — deep teal → emerald mist */}
      <div
        aria-hidden
        className="absolute inset-0 -z-30 bg-[radial-gradient(90%_70%_at_78%_42%,rgba(45,212,160,0.28)_0%,transparent_55%),radial-gradient(70%_55%_at_12%_80%,rgba(15,90,70,0.45)_0%,transparent_50%),linear-gradient(165deg,#041612_0%,#0a2a22_42%,#123d32_72%,#1a4d3c_100%)]"
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-[20%] top-[-10%] -z-20 h-[70vmax] w-[70vmax] rounded-full bg-[radial-gradient(circle,rgba(88,204,2,0.22)_0%,transparent_68%)] blur-3xl"
        animate={
          reduced
            ? undefined
            : { x: [0, 36, -12, 0], y: [0, 18, -24, 0], scale: [1, 1.06, 0.98, 1] }
        }
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-[15%] bottom-[-20%] -z-20 h-[60vmax] w-[60vmax] rounded-full bg-[radial-gradient(circle,rgba(26,155,108,0.35)_0%,transparent_70%)] blur-3xl"
        animate={
          reduced
            ? undefined
            : { x: [0, -28, 16, 0], y: [0, -20, 12, 0], scale: [1, 0.96, 1.05, 1] }
        }
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Glass veil over the scene */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(4,22,18,0.15)_0%,transparent_35%,rgba(4,22,18,0.45)_100%)]"
      />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 pt-6">
        <span className="font-[family-name:var(--font-display)] text-lg font-extrabold tracking-tight text-[#e8f5e4]">
          x-pi
        </span>
        <Link
          to="/auth"
          className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm font-semibold text-[#c5ddd0] backdrop-blur-md transition hover:border-white/30 hover:bg-white/10 hover:text-[#e8f5e4]"
        >
          Sign in
        </Link>
      </header>

      <div className="relative z-10 mx-auto grid min-h-[calc(100svh-5rem)] max-w-6xl items-center gap-8 px-6 pb-16 pt-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-4">
        <div className="relative z-10 max-w-xl">
          <motion.p
            className="font-[family-name:var(--font-display)] text-[clamp(4.25rem,13vw,8.75rem)] font-extrabold leading-[0.88] tracking-[-0.045em]"
            {...rise(0, reduced)}
          >
            <span className="mkt-brand-sheen">x-pi</span>
          </motion.p>
          <motion.h1
            className="mt-5 max-w-lg font-[family-name:var(--font-display)] text-[clamp(1.55rem,3.4vw,2.55rem)] font-bold leading-[1.12] tracking-tight text-[#e8f5e4]"
            {...rise(0.12, reduced)}
          >
            Micro-lessons that move with you.
          </motion.h1>
          <motion.p
            className="mt-4 max-w-md text-lg font-medium leading-relaxed text-[#a8c4b4]"
            {...rise(0.22, reduced)}
          >
            Streaks, XP, and spaced practice — built for daily momentum, not marathon study.
          </motion.p>
          <motion.div className="mt-8" {...rise(0.32, reduced)}>
            <HeroCtas howHref="#how" />
          </motion.div>
        </div>

        {/* Dominant visual — atmosphere behind copy on small screens; stage on lg+ */}
        <div className="pointer-events-none absolute inset-0 -z-0 lg:pointer-events-auto lg:relative lg:inset-auto lg:h-[min(68vh,560px)] lg:min-h-[320px]">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-[2px] lg:block"
          />
          <div className="absolute inset-0 opacity-50 lg:opacity-100">
            <HeroVisual />
          </div>
        </div>
      </div>
    </section>
  );
}
