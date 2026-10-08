import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type PublicLesson } from "../lib/api";
import { BottomNav } from "../components/BottomNav";
import { TopStats } from "../components/TopStats";
import { useAppStore } from "../store";

export function HomePage() {
  const [lessons, setLessons] = useState<PublicLesson[]>([]);
  const [error, setError] = useState("");
  const setUser = useAppStore((s) => s.setUser);
  const setStreak = useAppStore((s) => s.setStreak);

  useEffect(() => {
    Promise.all([api.lessons(), api.stats()])
      .then(([l, s]) => {
        setLessons(l.lessons);
        setUser(s.user);
        setStreak(s.streak);
      })
      .catch((e) => setError(e.message));
  }, [setUser, setStreak]);

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
        {error && <p className="mt-4 font-bold text-[#ff4b4b]">{error}</p>}
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
                          to={`/lesson/${lesson.id}`}
                          className={`flex h-20 w-20 flex-col items-center justify-center rounded-full border-b-8 text-white transition hover:brightness-105 active:border-b-4 active:translate-y-1 ${
                            lesson.completed
                              ? "border-[#46a302] bg-[#58cc02]"
                              : "border-[#1899d6] bg-[#1cb0f6]"
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
