import { Link } from "react-router-dom";
import type { PublicLesson } from "../../lib/api";

export type PathLesson = PublicLesson;

/** Duolingo-like lesson node on the learn path. */
export function LearnPathNode({
  lesson,
  idx,
  isCurrent,
}: {
  lesson: PathLesson;
  idx: number;
  isCurrent: boolean;
}) {
  const offset = idx % 2 === 0 ? "ml-[18%]" : "ml-[52%]";
  const meta = (
    <div className="mt-2 max-w-[140px]">
      <div className="font-extrabold leading-tight">{lesson.title}</div>
      <div className="text-xs font-bold text-[#777]">
        +{lesson.xpReward} XP
        {lesson.stars > 0 ? ` · ${"★".repeat(lesson.stars)}` : ""}
      </div>
      {lesson.hasActiveSession ? (
        <div className="mt-0.5 text-xs font-black uppercase tracking-wide text-[#1cb0f6]">
          Resume
        </div>
      ) : null}
      {isCurrent && !lesson.completed && !lesson.locked ? (
        <div className="mt-0.5 text-xs font-black uppercase tracking-wide text-[#58cc02]">
          Up next
        </div>
      ) : null}
    </div>
  );

  if (lesson.locked) {
    return (
      <li className={`relative ${offset}`}>
        <div
          className="flex h-20 w-20 flex-col items-center justify-center rounded-full border-4 border-[#e5e5e5] bg-[#f0f0f0] text-[#afafaf]"
          aria-label={`${lesson.title} locked`}
          title="Complete the previous lesson to unlock"
        >
          <span className="text-2xl" aria-hidden>
            🔒
          </span>
        </div>
        {meta}
      </li>
    );
  }

  return (
    <li className={`relative ${offset}`}>
      <Link
        to={`/learn/lesson/${lesson.id}`}
        aria-current={isCurrent ? "step" : undefined}
        className={`flex h-20 w-20 flex-col items-center justify-center rounded-full border-b-8 text-white transition hover:brightness-105 active:translate-y-1 active:border-b-4 ${
          lesson.completed
            ? "border-[#46a302] bg-[var(--xpi-green)]"
            : "border-[#1899d6] bg-[var(--xpi-blue)]"
        } ${isCurrent ? "learn-path-current ring-4 ring-[#58cc02]/40" : ""}`}
      >
        <span className="text-2xl font-black" aria-hidden>
          {lesson.hasActiveSession ? "↻" : lesson.completed ? "★" : "▶"}
        </span>
      </Link>
      {meta}
    </li>
  );
}

export function LearnPath({ lessons }: { lessons: PathLesson[] }) {
  const units = lessons.reduce<Record<number, PathLesson[]>>((acc, l) => {
    (acc[l.unitOrder] ||= []).push(l);
    return acc;
  }, {});

  const currentId =
    lessons.find((l) => !l.locked && !l.completed)?.id ??
    lessons.find((l) => l.hasActiveSession)?.id ??
    null;

  return (
    <div className="relative mt-8 space-y-10">
      <div
        className="pointer-events-none absolute bottom-4 left-1/2 top-4 w-1 -translate-x-1/2 rounded-full bg-[#e5e5e5]"
        aria-hidden
      />
      {Object.entries(units).map(([unit, items]) => {
        const unitNum = Number(unit);
        const doneCount = items.filter((l) => l.completed).length;
        return (
          <section key={unit} className="relative" aria-labelledby={`unit-${unit}`}>
            <div className="mb-4 flex items-center gap-2">
              <div
                id={`unit-${unit}`}
                className="inline-block rounded-xl bg-[#58cc02] px-3 py-1 text-sm font-black uppercase tracking-wide text-white"
              >
                Unit {unitNum}
              </div>
              <span className="text-xs font-bold text-[#777]">
                {doneCount}/{items.length} done
              </span>
            </div>
            <ul className="space-y-6">
              {items.map((lesson, idx) => (
                <LearnPathNode
                  key={lesson.id}
                  lesson={lesson}
                  idx={idx}
                  isCurrent={lesson.id === currentId}
                />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
