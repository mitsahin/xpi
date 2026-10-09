import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError, api, type PublicLesson } from "../lib/api";
import { BottomNav } from "../components/BottomNav";
import { TopStats } from "../components/TopStats";
import {
  LearnEmptyState,
  LearnErrorState,
  LearnLoading,
  LearnPath,
} from "../components/learn/LessonShell";
import { useAppStore } from "../store";

export function HomePage() {
  const [lessons, setLessons] = useState<PublicLesson[]>([]);
  const [dueReviews, setDueReviews] = useState(0);
  const [error, setError] = useState("");
  const [offline, setOffline] = useState(false);
  const [loading, setLoading] = useState(true);
  const setUser = useAppStore((s) => s.setUser);
  const setStreak = useAppStore((s) => s.setStreak);
  const setApiHealthy = useAppStore((s) => s.setApiHealthy);

  const load = useCallback(() => {
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
  }, [setUser, setStreak, setApiHealthy]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="min-h-full bg-[linear-gradient(180deg,#f7fff0_0%,#ffffff_280px)] pb-24">
      <TopStats />
      <main className="mx-auto max-w-lg px-4 py-6">
        <h1 className="text-2xl font-black">Spanish Basics</h1>
        <p className="mt-1 font-bold text-[#777]">
          Follow the path. Earn XP. Keep your streak.
        </p>
        {dueReviews > 0 && (
          <Link
            to="/learn/reviews"
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
        {!loading && lessons.length > 0 ? <LearnPath lessons={lessons} /> : null}
      </main>
      <BottomNav />
    </div>
  );
}
