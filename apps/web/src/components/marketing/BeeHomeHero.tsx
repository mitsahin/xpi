import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BeeMascot } from "../brand/BeeMascot";
import { useAppStore } from "../../store";

/**
 * Default marketing homepage (H2): centered bee, Duolingo-like light layout.
 * Concept: bee-home-2 / bee-h2-original — original x-pi bee, not Duo owl.
 */
export function BeeHomeHero() {
  const token = useAppStore((s) => s.token);
  const startTo = token ? "/learn" : "/auth";

  return (
    <section
      className="bee-home relative isolate min-h-[100svh] overflow-hidden bg-[#fffcf5]"
      data-home="h2"
    >
      {/* soft corner waves */}
      <svg
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 h-40 w-64 text-[#ffe566]/50"
        viewBox="0 0 260 160"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          d="M0 160 C40 90 90 120 130 80 C160 50 200 70 260 40 L260 160 Z"
        />
      </svg>
      <svg
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 h-36 w-56 text-[#ffe566]/40"
        viewBox="0 0 240 140"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          d="M0 50 C60 20 100 60 150 40 C190 24 220 30 240 18 L240 140 L0 140 Z"
        />
      </svg>

      {/* dashed flight ring */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[7.5rem] h-56 w-56 -translate-x-1/2 rounded-full border-2 border-dashed border-[#ffc800]/45 md:top-[8.5rem] md:h-64 md:w-64"
      />

      <header className="relative z-20 mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-5 md:px-8">
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-black tracking-tight text-[#1b2a4a]"
          style={{ fontFamily: "var(--font-learn)" }}
        >
          <BeeMascot size={36} title="" />
          <span>x-pi</span>
        </Link>
        <Link
          to="/auth"
          className="rounded-2xl border-2 border-[#1b2a4a]/15 bg-white px-4 py-2 text-sm font-extrabold text-[#1b2a4a] transition hover:border-[#58cc02] hover:text-[#58cc02]"
        >
          Giriş
        </Link>
      </header>

      <div className="relative z-10 mx-auto flex max-w-xl flex-col items-center px-5 pb-24 pt-6 text-center md:pt-10">
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="bee-bob"
        >
          <BeeMascot size={220} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.5 }}
          className="mt-4 text-[clamp(2rem,5.5vw,3.1rem)] font-black leading-[1.12] tracking-tight text-[#1b2a4a]"
          style={{ fontFamily: "var(--font-learn)" }}
        >
          Dili{" "}
          <span className="text-[#58cc02]">oyun gibi</span> öğren
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.45 }}
          className="mt-4 max-w-md text-base font-bold leading-relaxed text-[#7a857c] md:text-lg"
        >
          Oyunlaştırılmış dersler, eğlenceli alıştırmalar ve motivasyon
          ödülleriyle her gün biraz daha ilerle.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.45 }}
          className="mt-8 flex w-full max-w-md flex-col items-stretch gap-3 sm:flex-row sm:justify-center"
        >
          <Link
            to={startTo}
            className="inline-flex items-center justify-center rounded-2xl bg-[#58cc02] px-7 py-4 text-base font-black text-white shadow-[0_4px_0_#46a302] transition hover:brightness-105 active:translate-y-1 active:shadow-[0_2px_0_#46a302]"
          >
            Öğrenmeye başla →
          </Link>
          <a
            href="#how"
            className="inline-flex items-center justify-center rounded-2xl border-2 border-[#1b2a4a]/20 bg-white px-6 py-3.5 text-base font-extrabold text-[#1b2a4a] transition hover:border-[#58cc02] hover:text-[#58cc02]"
          >
            Nasıl çalışır?
          </a>
        </motion.div>
      </div>
    </section>
  );
}
