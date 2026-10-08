import { lazy, Suspense } from "react";
import { useIsNarrow } from "./useIsNarrow";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

const HeroScene = lazy(() =>
  import("./HeroScene").then((m) => ({ default: m.HeroScene })),
);

function CssOrb() {
  return <div aria-hidden className="mkt-orb-fallback absolute inset-0" />;
}

/**
 * Dominant hero visual: R3F orb on capable desktops, CSS orb elsewhere.
 * Keeps three.js out of the critical path on mobile / reduced-motion.
 */
export function HeroVisual() {
  const reduced = usePrefersReducedMotion();
  const narrow = useIsNarrow();

  if (reduced || narrow) {
    return <CssOrb />;
  }

  return (
    <Suspense fallback={<CssOrb />}>
      <HeroScene animate />
    </Suspense>
  );
}
