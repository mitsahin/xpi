import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ApiError, api, type PublicLesson } from "../lib/api";
import { BottomNav } from "../components/BottomNav";
import { TopStats } from "../components/TopStats";
import {
  LearnEmptyState,
  LearnErrorState,
  LearnLoading,
  LearnPath,
  usePathVariant,
} from "../components/learn/LessonShell";
import {
  DEMO_LESSONS,
  DEMO_STREAK,
  DEMO_USER,
} from "../components/learn/demoLessons";
import { useAppStore } from "../store";

export function HomePage() {
  const [params] = useSearchParams();
  const demo = params.get("demo") === "1";
  const pathVariant = usePathVariant();
  const [lessons, setLessons] = useState<PublicLesson[]>([]);
  const [dueReviews, setDueReviews] = useState(0);
  const [error, setError] = useState("");
  const [offline, setOffline] = useState(false);
  const [loading, setLoading] = useState(true);
  const setUser = useAppStore((s) => s.setUser);
  const setStreak = useAppStore((s) => s.setStreak);
  const setApiHealthy = useAppStore((s) => s.setApiHealthy);

  const load = useCallback(() => {
    if (demo) {
      setLessons(DEMO_LESSONS);
      setUser(DEMO_USER);
      setStreak(DEMO_STREAK);
      setDueReviews(2);
      setError("");
      setOffline(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    Promise.all([api.lessons(), api.stats(), api.reviews()])
      .then(([l, s, r]) => {
        setLessons(l.lessons);
        setUser(s.user);
        setStreak(s.streak);
        setDueReviews(r.reviews.length);
        setOffline(false);
        setApiHealthy(true);
      })
      .catch((e) => {
        const msg = e instanceof Error ? e.message : "Failed to load";
        setError(msg);
        if (e instanceof ApiError && e.offline) {
          setOffline(true);
          setApiHealthy(false);
        }
      })
      .finally(() => setLoading(false));
  }, [demo, setUser, setStreak, setApiHealthy]);

  useEffect(() => {
    load();
  }, [load]);

  const compareHref = useMemo(() => {
    const next = pathVariant === "classic" ? "pro" : "classic";
    const q = new URLSearchParams(params);
    q.set("path", next);
    if (demo) q.set("demo", "1");
    return `/learn?${q.toString()}`;
  }, [params, pathVariant, demo]);

  return (
    <div className="learn-path-page min-h-full bg-[#f7f7f7] pb-28">
      <TopStats />
      <main className="mx-auto max-w-md px-4 pb-6 pt-4">
        <div className="mb-1 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#afafaf]">
              Section 1
            </p>
            <h1 className="text-[1.65rem] font-black leading-tight text-[#3c3c3c]">
              Spanish Basics
            </h1>
          </div>
          <Link
            to={compareHref}
            className="shrink-0 rounded-xl border-2 border-[#e5e5e5] bg-white px-2.5 py-1.5 text-[11px] font-black uppercase tracking-wide text-[#777]"
            title="Toggle path density variant"
          >
            Path: {pathVariant}
          </Link>
        </div>
        <p className="font-bold text-[#afafaf]">
          Follow the path · Earn XP · Keep your streak
        </p>

        {dueReviews > 0 && (
          <Link
            to={demo ? "/learn/reviews?demo=1" : "/learn/reviews"}
            className="mt-4 flex items-center justify-between rounded-2xl border-2 border-b-4 border-[#ce82ff] bg-[#f3e8ff] px-4 py-3 font-extrabold text-[#7c3aed]"
          >
            <span>
              ↻ {dueReviews} review{dueReviews === 1 ? "" : "s"} due
            </span>
            <span>Practice →</span>
          </Link>
        )}

        {error ? (
          <LearnErrorState message={error} offline={offline} onRetry={load} />
        ) : null}
        {loading ? <LearnLoading label="Loading your path..." /> : null}
        {!loading && !error && lessons.length === 0 ? (
          <LearnEmptyState
            title="No lessons yet"
            detail="Your course path will show up here once content is available."
          />
        ) : null}
        {!loading && lessons.length > 0 ? (
          <LearnPath lessons={lessons} variant={pathVariant} />
        ) : null}
      </main>
      <BottomNav />
    </div>
  );
}
