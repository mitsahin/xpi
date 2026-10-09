import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useState,
  type ErrorInfo,
  type ReactNode,
} from "react";
import { Link } from "react-router-dom";
import { useAppStore } from "../../store";

/**
 * Community source: https://app.spline.design/community/file/1e04839b-4592-4ee7-b3a7-6892e2df2b93
 * Resolved via community-api exportURL (uuidFile 4f62eec9-…) → public runtime:
 * https://my.spline.design/menugame-3898196a32ef9f54ef4b233ba23b5334/scene.splinecode
 * (Community page URLs are not valid react-spline `scene` props.)
 */
const SCENE_URL =
  "https://my.spline.design/menugame-3898196a32ef9f54ef4b233ba23b5334/scene.splinecode";
const POSTER_URL =
  "https://community-filepreview.spline.design/webp-90/1e04839b-4592-4ee7-b3a7-6892e2df2b93.webp";

const Spline = lazy(() => import("@splinetool/react-spline"));

function useAllowHeavy3d() {
  const [allow, setAllow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
    );
    const sync = () => setAllow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return allow;
}

class SplineSafe extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(_e: Error, _info: ErrorInfo) {
    /* fall back to poster — avoid crashing low-end / blocked WebGL */
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function Poster({ className }: { className?: string }) {
  return (
    <img
      src={POSTER_URL}
      alt=""
      className={className}
      decoding="async"
      fetchPriority="high"
    />
  );
}

export function SplineHomeHero() {
  const token = useAppStore((s) => s.token);
  const startTo = token ? "/learn" : "/auth";
  const heavy3d = useAllowHeavy3d();

  const sceneLayer = (
    <Poster className="absolute inset-0 h-full w-full object-cover" />
  );

  return (
    <section
      className="spline-home relative isolate min-h-[100svh] overflow-hidden bg-[#0b1220]"
      data-home="spline"
    >
      <div aria-hidden className="absolute inset-0 -z-10">
        {heavy3d ? (
          <SplineSafe fallback={sceneLayer}>
            <Suspense fallback={sceneLayer}>
              <Spline
                scene={SCENE_URL}
                className="absolute inset-0 h-full w-full"
                style={{ width: "100%", height: "100%" }}
              />
            </Suspense>
          </SplineSafe>
        ) : (
          sceneLayer
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1220]/90 via-[#0b1220]/35 to-[#0b1220]/20" />
      </div>

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 pt-6">
        <Link
          to="/"
          className="font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-tight text-white"
        >
          x-pi
        </Link>
        <Link
          to="/auth"
          className="text-sm font-semibold text-white/70 transition hover:text-white"
        >
          Giriş
        </Link>
      </header>

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-5rem)] max-w-6xl flex-col justify-end px-6 pb-16 pt-10 md:justify-center">
        <p className="mkt-rise font-[family-name:var(--font-display)] text-[clamp(4rem,12vw,8rem)] font-extrabold leading-[0.9] tracking-[-0.04em] text-white">
          x-pi
        </p>
        <h1 className="mkt-rise-delay mt-5 max-w-xl font-[family-name:var(--font-learn)] text-[clamp(1.6rem,3.5vw,2.5rem)] font-black leading-[1.1] tracking-tight text-white">
          Dili oyun gibi öğren
        </h1>
        <p className="mkt-rise-delay-2 mt-3 max-w-md text-base font-semibold leading-relaxed text-white/75 md:text-lg">
          Kısa dersler, streak ve akıllı tekrarlar — her gün biraz daha ilerle.
        </p>
        <div className="mkt-rise-delay-2 mt-8 flex flex-wrap items-center gap-3">
          <Link
            to={startTo}
            className="inline-flex items-center justify-center rounded-full bg-[#fed12e] px-7 py-3.5 text-base font-black text-[#0c213c] transition hover:brightness-105"
          >
            Öğrenmeye başla
          </Link>
          <a
            href="#how"
            className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 px-7 py-3.5 text-base font-extrabold text-white backdrop-blur transition hover:border-white/40 hover:bg-white/15"
          >
            Nasıl çalışır?
          </a>
        </div>
        <p className="mt-6 text-xs font-medium text-white/45">
          <a
            href="https://app.spline.design/community/file/1e04839b-4592-4ee7-b3a7-6892e2df2b93"
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-2 hover:underline"
          >
            Scene by myre
          </a>
          {" · "}
          <a
            href="https://spline.design"
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-2 hover:underline"
          >
            Made with Spline
          </a>
        </p>
      </div>
    </section>
  );
}
