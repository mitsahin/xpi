import { motion } from "framer-motion";
import type { MouseEvent } from "react";
import { Link } from "react-router-dom";
import { useAppStore } from "../../store";
import type { HeroTheme } from "./heroThemes";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

type HeroCtasProps = {
  howHref?: string;
  theme: HeroTheme;
};

function scrollToHow(e: MouseEvent<HTMLAnchorElement>, href: string) {
  if (!href.startsWith("#")) return;
  e.preventDefault();
  const id = href.slice(1);
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * Primary marketing CTAs — start learning (auth-aware) + how-it-works scroll.
 */
export function HeroCtas({ howHref = "#how", theme }: HeroCtasProps) {
  const token = useAppStore((s) => s.token);
  const reduced = usePrefersReducedMotion();
  const startTo = token ? "/learn" : "/auth";

  const hover = reduced ? undefined : { scale: 1.03, y: -1 };
  const tap = reduced ? undefined : { scale: 0.97 };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <motion.div whileHover={hover} whileTap={tap} transition={{ type: "spring", stiffness: 420, damping: 28 }}>
        <Link
          to={startTo}
          className="inline-flex items-center justify-center rounded-full px-7 py-3.5 text-base font-bold text-white transition-colors"
          style={{
            backgroundColor: theme.ctaBg,
            boxShadow: theme.ctaShadow,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.ctaHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme.ctaBg;
          }}
        >
          Öğrenmeye Başlayın
        </Link>
      </motion.div>
      <motion.div whileHover={hover} whileTap={tap} transition={{ type: "spring", stiffness: 420, damping: 28 }}>
        <a
          href={howHref}
          onClick={(e) => scrollToHow(e, howHref)}
          className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-7 py-3.5 text-base font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md transition-colors hover:border-white/35 hover:bg-white/16"
          style={{ color: theme.glassText }}
        >
          Nasıl Çalışır
        </a>
      </motion.div>
    </div>
  );
}
