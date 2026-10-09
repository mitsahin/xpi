import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BeeMascot, InteractiveBeeMascot } from "../brand/BeeMascot";
import { useAppStore } from "../../store";

/**
 * Default marketing homepage (H2): centered bee splash matching bee-home-2.
 * Logo top-center (small bee + Walky Talky). Discreet Giriş top-right only.
 */
export function BeeHomeHero() {
  const token = useAppStore((s) => s.token);
  const startTo = token ? "/learn" : "/auth";

  return (
    <section
      className="bee-home relative isolate min-h-[100svh] overflow-hidden bg-[#fffffd]"
      data-home="h2"
    >
      <svg
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 h-[30%] w-[56%] text-[#fff9e3]"
        viewBox="0 0 620 260"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          d="M0 260V88C90 48 160 130 250 100C340 70 390 18 470 64C530 96 580 150 620 188V260Z"
        />
      </svg>
      <svg
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 h-[28%] w-[56%] text-[#fff9e3]"
        viewBox="0 0 640 240"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          d="M0 168C80 112 150 156 240 118C340 76 400 28 500 62C560 86 600 46 640 22V240H0Z"
        />
      </svg>

      <div
        aria-hidden
        className="bee-dot-grid pointer-events-none absolute bottom-[11%] left-[5.5%] opacity-90"
      />
      <div
        aria-hidden
        className="bee-dot-grid pointer-events-none absolute bottom-[9%] right-[4.5%] opacity-90"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[27%] right-[10%] h-3.5 w-3.5 rounded-full bg-[#fed12e]"
      />

      <Link
        to="/auth"
        className="absolute right-5 top-5 z-30 text-[13px] font-bold text-[#0c213c]/40 transition hover:text-[#0c213c]/75 md:right-8"
      >
        Giriş
      </Link>

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-3xl flex-col items-center px-5 pb-28 pt-7 text-center">
        <Link
          to="/"
          className="flex items-center gap-2.5 text-[1.65rem] font-black tracking-tight text-[#0c213c]"
          style={{ fontFamily: "var(--font-learn)" }}
        >
          <BeeMascot size={40} title="" />
          <span>Walky Talky</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="bee-bob relative mt-6"
        >
          <svg
            aria-hidden
            className="pointer-events-none absolute -left-16 top-2 h-44 w-28 text-[#f0c44a]"
            viewBox="0 0 110 170"
            fill="none"
          >
            <path
              d="M96 12C62 28 36 62 32 108"
              stroke="currentColor"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeDasharray="1.2 10"
            />
            <circle cx="78" cy="36" r="4" fill="currentColor" />
            <circle cx="48" cy="78" r="3.2" fill="currentColor" />
          </svg>
          <span
            aria-hidden
            className="pointer-events-none absolute -right-6 top-6 h-2.5 w-2.5 rounded-full bg-[#f0c44a]"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -right-10 top-24 h-2 w-2 rounded-full bg-[#f0c44a]"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -right-8 bottom-6 h-3.5 w-3.5 rounded-full border-2 border-[#f0c44a]"
          />
          <InteractiveBeeMascot size={204} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.45 }}
          className="mt-2 text-[clamp(2.35rem,5.4vw,3.25rem)] font-black leading-[1.05] tracking-tight text-[#0c213c]"
          style={{ fontFamily: "var(--font-learn)" }}
        >
          Dili oyun gibi
          <br />
          öğren
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.4 }}
          className="mt-4 max-w-md text-[15px] font-semibold leading-relaxed text-[#535458] md:text-base"
        >
          Oyunlaştırılmış dersler, eğlenceli alıştırmalar ve motivasyon
          ödülleriyle her gün biraz daha ilerle.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26, duration: 0.4 }}
          className="mt-7 flex w-full max-w-md flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link
            to={startTo}
            className="inline-flex min-w-[13.5rem] items-center justify-center rounded-full bg-[#fed12e] px-7 py-3.5 text-[15px] font-black text-[#0c213c] transition hover:brightness-105"
          >
            Öğrenmeye başla →
          </Link>
          <a
            href="#how"
            className="inline-flex min-w-[11.5rem] items-center justify-center rounded-full border border-[#d4d4d4] bg-white px-7 py-3.5 text-[15px] font-extrabold text-[#0c213c] transition hover:border-[#c4c4c4]"
          >
            Nasıl çalışır?
          </a>
        </motion.div>
      </div>
    </section>
  );
}
