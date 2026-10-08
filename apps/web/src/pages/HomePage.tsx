import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError, api, type PublicLesson } from "../lib/api";
import { BottomNav } from "../components/BottomNav";
import { TopStats } from "../components/TopStats";
import { useAppStore } from "../store";

export function HomePage() {
  const [lessons, setLessons] = useState<PublicLesson[]>([]);
  const [dueReviews, setDueReviews] = useState(0);
  const [error, setError] = useState("");
  const [offline, setOffline] = useState(false);
  const setUser = useAppStore((s) => s.setUser);
  const setStreak = useAppStore((s) => s.setStreak);
  const setApiHealthy = useAppStore((s) => s.setApiHealthy);

  useEffect(() => {
    Promise.all([api.lessons(), api.stats(), api.reviews()])
      .then(([l, s, r]) => {
        setLessons(l.lessons);
        setUser(s.user);
        setStreak(s.streak);
        setDueReviews(r.reviews.length);
        setError("");
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
      });
  }, [setUser, setStreak, setApiHealthy]);

  const units = lessons.reduce<Record<number, PublicLesson[]>>((acc, l) => {
    (acc[l.unitOrder] ||= []).push(l);
    return acc;
  }, {});

  return (
    <div className="min-h-full bg-[linear-gradient(180deg,#f7fff0_0%,#ffffff_280px)] pb-24">
      <TopStats />
      <main className="mx-auto max-w-lg px-4 py-6">
        <h1 className="text-2xl font-black">Spanish Basics</h1>
        <p className="mt-1 font-bold text-[#777]">Follow the path. Earn XP. Keep your streak.</p>
        {dueReviews > 0 && (
          <Link
            to="/learn/reviews"
            className="mt-4 flex items-center justify-between rounded-2xl border-2 border-b-4 border-[#ce82ff] bg-[#f3e8ff] px-4 py-3 font-extrabold text-[#7c3aed]"
          >
            <span>↻ {dueReviews} review{dueReviews === 1 ? "" : "s"} due</span>
            <span>Practice →</span>
          </Link>
        )}
        {error && (
          <div
            className={`mt-4 rounded-2xl border-2 px-4 py-3 font-bold ${
              offline
                ? "border-[#ffb02e] bg-[#fff4ce] text-[#915f10]"
                : "border-[#ff4b4b] bg-[#fff0f0] text-[#ff4b4b]"
            }`}
          >
            <p>{error}</p>
            {offline && (
              <button
                type="button"
                className="mt-2 underline"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            )}
          </div>
        )}
        <div className="relative mt-8 space-y-10">
          <div className="pointer-events-none absolute left-1/2 top-4 bottom-4 w-1 -translate-x-1/2 rounded-full bg-[#e5e5e5]" />
          {Object.entries(units).map(([unit, items]) => (
            <section key={unit} className="relative">
              <div className="mb-4 inline-block rounded-xl bg-[#58cc02] px-3 py-1 text-sm font-black uppercase tracking-wide text-white">
                Unit {unit}
              </div>
              <ul className="space-y-6">
                {items.map((lesson, idx) => {
                  const offset = idx % 2 === 0 ? "ml-[18%]" : "ml-[52%]";
                  return (
                    <li key={lesson.id} className={`relative ${offset}`}>
                      {lesson.locked ? (
                        <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full border-4 border-[#e5e5e5] bg-[#f0f0f0] text-[#afafaf]">
                          <span className="text-2xl">🔒</span>
                        </div>
                      ) : (
                        <Link
                          to={`/learn/lesson/${lesson.id}`}
                          className={`flex h-20 w-20 flex-col items-center justify-center rounded-full border-b-8 text-white transition hover:brightness-105 active:border-b-4 active:translate-y-1 ${
                            lesson.completed
                              ? "border-[#46a302] bg-[var(--xpi-green)]"
                              : "border-[#1899d6] bg-[var(--xpi-blue)]"
                          }`}
                        >
                          <span className="text-2xl font-black">
                            {lesson.completed ? "★" : "▶"}
                          </span>
                        </Link>
                      )}
                      <div className="mt-2 max-w-[140px]">
                        <div className="font-extrabold leading-tight">{lesson.title}</div>
                        <div className="text-xs font-bold text-[#777]">
                          +{lesson.xpReward} XP
                          {lesson.stars > 0 ? ` · ${"★".repeat(lesson.stars)}` : ""}
                          {lesson.hasActiveSession ? " · resume" : ""}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
