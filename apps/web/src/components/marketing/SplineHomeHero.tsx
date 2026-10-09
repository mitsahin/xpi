import { lazy, Suspense, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppStore } from "../../store";
import {
  COMMUNITY_CREATOR,
  COMMUNITY_PAGE_URL,
  COMMUNITY_PREVIEW_IFRAME,
  COMMUNITY_THUMBNAIL,
  SPLINE_SCENE_URL,
} from "./splineScene";

const Spline = lazy(() => import("@splinetool/react-spline"));

type HeroMode = "pending" | "scene" | "light";

function useHeroMode(): HeroMode {
  const [mode, setMode] = useState<HeroMode>("pending");

  useEffect(() => {
    const narrow = window.matchMedia("(max-width: 767px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const nav = navigator as Navigator & { deviceMemory?: number };
    const lowMem = typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4;

    const update = () => {
      setMode(narrow.matches || reduced.matches || lowMem ? "light" : "scene");
    };
    update();
    narrow.addEventListener("change", update);
    reduced.addEventListener("change", update);
    return () => {
      narrow.removeEventListener("change", update);
      reduced.removeEventListener("change", update);
    };
  }, []);

  return mode;
}

/**
 * Default marketing homepage: Spline scene hero (react-spline when Export URL
 * is set; otherwise Community preview iframe). Light static fallback on mobile /
 * reduced-motion / low-memory.
 */
export function SplineHomeHero() {
  const token = useAppStore((s) => s.token);
  const startTo = token ? "/learn" : "/auth";
  const mode = useHeroMode();
  const useReactSpline = Boolean(SPLINE_SCENE_URL);

  return (
    <section
      className="spline-home relative isolate min-h-[100svh] overflow-hidden bg-[#0b1220] text-white"
      data-home="spline"
    >
      <div aria-hidden className="absolute inset-0 -z-20">
        {mode === "light" || mode === "pending" ? (
          <StaticSceneFallback />
        ) : useReactSpline ? (
          <Suspense fallback={<StaticSceneFallback />}>
            <Spline
              scene={SPLINE_SCENE_URL}
              className="h-full w-full"
              style={{ width: "100%", height: "100%" }}
            />
          </Suspense>
        ) : (
          <iframe
            title="Walky Talky Spline scene"
            src={COMMUNITY_PREVIEW_IFRAME}
            className="h-full w-full border-0"
            allow="fullscreen; autoplay"
            loading="lazy"
          />
        )}
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(8,12,24,0.72)_0%,rgba(8,12,24,0.35)_42%,rgba(8,12,24,0.78)_100%)]"
      />

      <Link
        to="/auth"
        className="absolute right-5 top-5 z-30 text-[13px] font-bold text-white/55 transition hover:text-white/90 md:right-8"
      >
        Giriş
      </Link>

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-3xl flex-col items-center justify-center px-5 pb-24 pt-16 text-center">
        <Link
          to="/"
          className="mkt-rise text-[clamp(3.5rem,12vw,6.5rem)] font-extrabold leading-[0.9] tracking-[-0.04em] text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Walky Talky
        </Link>

        <h1
          className="mkt-rise-delay mt-5 max-w-xl text-[clamp(1.45rem,3.6vw,2.15rem)] font-bold leading-tight tracking-tight text-white/95"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Dili oyun gibi öğren
        </h1>
        <p className="mkt-rise-delay-2 mt-3 max-w-md text-[15px] font-medium leading-relaxed text-white/70 md:text-base">
          Kısa dersler, streak ve akıllı tekrarlar — her gün biraz ilerleme.
        </p>

        <div className="mkt-rise-delay-2 mt-8 flex w-full max-w-md flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to={startTo}
            className="inline-flex min-w-[13.5rem] items-center justify-center rounded-full bg-[#ffc800] px-7 py-3.5 text-[15px] font-black text-[#0c213c] transition hover:brightness-105"
          >
            Öğrenmeye başla
          </Link>
          <a
            href="#how"
            className="inline-flex min-w-[11.5rem] items-center justify-center rounded-full border border-white/25 bg-white/10 px-7 py-3.5 text-[15px] font-extrabold text-white backdrop-blur transition hover:border-white/40 hover:bg-white/15"
          >
            Nasıl çalışır?
          </a>
        </div>

        <p className="mt-10 text-[11px] font-semibold tracking-wide text-white/45">
          <a
            href={COMMUNITY_PAGE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-white/25 underline-offset-2 hover:text-white/70"
          >
            Scene by @{COMMUNITY_CREATOR}
          </a>
          {" · "}
          <a
            href="https://spline.design"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-white/25 underline-offset-2 hover:text-white/70"
          >
            Made with Spline
          </a>
        </p>
      </div>
    </section>
  );
}

function StaticSceneFallback() {
  return (
    <div
      className="absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_20%,#2a4a7a_0%,transparent_55%),linear-gradient(165deg,#101828_0%,#1a2740_45%,#0b1220_100%)]"
      style={{
        backgroundImage: `linear-gradient(180deg,rgba(8,12,24,0.35),rgba(8,12,24,0.75)), url(${COMMUNITY_THUMBNAIL}), radial-gradient(90% 70% at 50% 20%, #2a4a7a 0%, transparent 55%), linear-gradient(165deg, #101828 0%, #1a2740 45%, #0b1220 100%)`,
        backgroundSize: "cover, cover, cover, cover",
        backgroundPosition: "center",
      }}
    />
  );
}
