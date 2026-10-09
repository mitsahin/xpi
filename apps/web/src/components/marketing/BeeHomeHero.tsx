import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BeeLogoMark, InteractiveBeeMascot } from "../brand/BeeMascot";
import { useAppStore } from "../../store";

/**
 * Default marketing homepage (H2): exact match to bee-home-2 reference.
 * Logo TOP-LEFT (not centered — prior centered logo was rejected).
 * Discreet Giriş only. Yellow CTAs, cream bg, pale yellow wave + corner dots.
 */
export function BeeHomeHero() {
  const token = useAppStore((s) => s.token);
  const startTo = token ? "/learn" : "/auth";

  return (
    <section
      className="bee-home relative isolate min-h-[100svh] overflow-hidden bg-[#fffcf5]"
      data-home="h2"
    >
      {/* continuous pale yellow wave across bottom (bee-home-2) */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 w-full text-[#ffe566]/55 md:h-36"
        viewBox="0 0 1280 180"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          d="M0 180 L0 90 C160 40 280 110 420 70 C560 30 680 95 820 55 C960 20 1100 70 1280 40 L1280 180 Z"
        />
      </svg>

      {/* yellow dot grids in corners (reference) */}
      <div
        aria-hidden
        className="bee-dot-grid pointer-events-none absolute bottom-8 left-6 opacity-80"
      />
      <div
        aria-hidden
        className="bee-dot-grid pointer-events-none absolute bottom-8 right-6 opacity-70"
      />

      {/* faint dashed yellow arc behind bee (reference) */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[7.75rem] h-52 w-52 -translate-x-1/2 rounded-full border-2 border-dashed border-[#ffc800]/42 md:top-[8.5rem] md:h-60 md:w-60"
      />

      {/* floating yellow accents around mascot (bee-home-2) */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[9rem] h-2.5 w-2.5 -translate-x-[8rem] rounded-full bg-[#ffc800]/75 md:top-[10rem]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[13.5rem] h-3.5 w-3.5 translate-x-[7rem] rounded-full border-2 border-[#ffc800]/55 md:top-[14.5rem]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[17.5rem] h-1.5 w-1.5 -translate-x-[6rem] rounded-full bg-[#ffc800]/55"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[11.5rem] h-1.5 w-1.5 translate-x-[5.5rem] rounded-full bg-[#ffc800]/65"
      />

      {/* Logo TOP-LEFT — bee head + bold x-pi (dark navy). NOT centered. */}
      <header className="relative z-20 flex w-full items-center justify-between px-5 py-5 md:px-8">
        <Link
          to="/"
          className="flex items-center gap-2 text-[1.35rem] font-black tracking-tight text-[#1b2a4a]"
          style={{ fontFamily: "var(--font-learn)" }}
        >
          <BeeLogoMark size={30} />
          <span>x-pi</span>
        </Link>
        {/* very discreet top-right — text only, no competing pill */}
        <Link
          to="/auth"
          className="rounded-full border border-[#1b2a4a]/12 px-3.5 py-1.5 text-sm font-bold text-[#1b2a4a]/50 transition hover:border-[#1b2a4a]/25 hover:text-[#1b2a4a]/80"
        >
          Giriş
        </Link>
      </header>

      <div className="relative z-10 mx-auto flex max-w-xl flex-col items-center px-5 pb-24 pt-2 text-center md:pt-4">
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="bee-bob"
        >
          <InteractiveBeeMascot size={210} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.5 }}
          className="mt-2 text-[clamp(2.05rem,5.5vw,3.15rem)] font-black leading-[1.1] tracking-tight text-[#1b2a4a]"
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
            className="inline-flex items-center justify-center rounded-full border-2 border-[#1b2a4a]/18 bg-white px-7 py-3.5 text-base font-extrabold text-[#1b2a4a] transition hover:border-[#ffc800]"
          >
            Nasıl çalışır?
          </a>
        </motion.div>
      </div>
    </section>
  );
}
