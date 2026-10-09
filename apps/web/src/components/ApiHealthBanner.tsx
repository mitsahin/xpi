import { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { useAppStore } from "../store";

/** Non-blocking banner when the API is unreachable (learn routes only). */
export function ApiHealthBanner() {
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const onLearn = pathname.startsWith("/learn");
  const shot = params.get("shot") === "1";
  const healthy = useAppStore((s) => s.apiHealthy);
  const setApiHealthy = useAppStore((s) => s.setApiHealthy);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!onLearn || shot) return;
    let cancelled = false;
    const tick = async () => {
      const r = await api.health();
      if (!cancelled) setApiHealthy(r.ok);
    };
    void tick();
    const id = window.setInterval(tick, 20_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [onLearn, shot, setApiHealthy]);

  if (!onLearn || shot || healthy !== false) return null;

  return (
    <div
      role="status"
      className="sticky top-0 z-50 border-b-2 border-[#ffb02e] bg-[#fff4ce] px-4 py-2 text-center text-sm font-extrabold text-[#915f10]"
    >
      API offline — start it with{" "}
      <code className="rounded bg-white/80 px-1">npm run dev:api</code> (port 4000).
      <button
        type="button"
        disabled={checking}
        className="ml-3 underline disabled:opacity-50"
        onClick={async () => {
          setChecking(true);
          const r = await api.health();
          setApiHealthy(r.ok);
          setChecking(false);
        }}
      >
        {checking ? "Checking…" : "Retry"}
      </button>
    </div>
  );
}
