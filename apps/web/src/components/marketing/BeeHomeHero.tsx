import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BeeMascot, InteractiveBeeMascot } from "../brand/BeeMascot";
import { useAppStore } from "../../store";

/**
 * Default marketing homepage (H2): centered bee splash — bee-home-2 concept.
 * Logo top-center, yellow primary CTA, soft cream + wave corners + dots.
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
        className="pointer-events-none absolute bottom-0 left-0 h-44 w-72 text-[#ffe566]/55"
        viewBox="0 0 280 170"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          d="M0 170 C50 100 100 130 140 85 C175 50 220 75 280 45 L280 170 Z"
        />
      </svg>
      <svg
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 h-40 w-64 text-[#ffe566]/45"
        viewBox="0 0 260 150"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          d="M0 55 C55 25 110 70 160 45 C200 28 230 35 260 20 L260 150 L0 150 Z"
        />
      </svg>

      {/* dotted accent grids (concept corners) */}
      <div
        aria-hidden
        className="bee-dot-grid pointer-events-none absolute bottom-6 left-5 opacity-70"
      />
      <div
        aria-hidden
        className="bee-dot-grid pointer-events-none absolute bottom-6 right-5 opacity-60"
      />

      {/* soft floating dots around mascot */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[9.5rem] h-2 w-2 -translate-x-[7.5rem] rounded-full bg-[#ffc800]/70 md:top-[10.5rem]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[14rem] h-1.5 w-1.5 translate-x-[6.5rem] rounded-full bg-[#ffc800]/55 md:top-[15rem]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[18rem] h-1 w-1 -translate-x-[5rem] rounded-full bg-[#ffc800]/45"
      />

      {/* dashed flight ring */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[8.25rem] h-56 w-56 -translate-x-1/2 rounded-full border-2 border-dashed border-[#ffc800]/40 md:top-[9rem] md:h-64 md:w-64"
      />

      {/* discreet sign-in — top-right, does not break centered logo */}
      <Link
        to="/auth"
        className="absolute right-4 top-5 z-30 text-sm font-extrabold text-[#1b2a4a]/70 transition hover:text-[#1b2a4a] md:right-8"
      >
        Giriş
      </Link>

      {/* logo TOP CENTER */}
      <header className="relative z-20 flex justify-center px-5 pb-2 pt-5 md:pt-6">
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-black tracking-tight text-[#1b2a4a]"
          style={{ fontFamily: "var(--font-learn)" }}
        >
          <BeeMascot size={34} title="" />
          <span>x-pi</span>
        </Link>
      </header>

      <div className="relative z-10 mx-auto flex max-w-xl flex-col items-center px-5 pb-24 pt-4 text-center md:pt-6">
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="bee-bob"
        >
          <InteractiveBeeMascot size={220} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.5 }}
          className="mt-3 text-[clamp(2rem,5.5vw,3.15rem)] font-black leading-[1.12] tracking-tight text-[#1b2a4a]"
          style={{ fontFamily: "var(--font-learn)" }}
        >
          Dili oyun gibi
          <br />
          öğren
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
            className="inline-flex items-center justify-center rounded-full bg-[#ffc800] px-8 py-4 text-base font-black text-[#1b2a4a] shadow-[0_4px_0_#e6b400] transition hover:brightness-105 active:translate-y-1 active:shadow-[0_2px_0_#e6b400]"
          >
            Öğrenmeye başla →
          </Link>
          <a
            href="#how"
            className="inline-flex items-center justify-center rounded-full border-2 border-[#1b2a4a]/18 bg-white px-7 py-3.5 text-base font-extrabold text-[#1b2a4a] transition hover:border-[#ffc800] hover:text-[#1b2a4a]"
          >
            Nasıl çalışır?
          </a>
        </motion.div>
      </div>
    </section>
  );
}
