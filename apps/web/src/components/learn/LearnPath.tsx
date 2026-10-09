import { Link, useSearchParams } from "react-router-dom";
import type { PublicLesson } from "../../lib/api";
import { PathMascot } from "./PathMascot";

export type PathLesson = PublicLesson;
export type PathVariant = "classic" | "pro";

export function usePathVariant(): PathVariant {
  const [params] = useSearchParams();
  return params.get("path") === "pro" ? "pro" : "classic";
}

function nodeX(idx: number, variant: PathVariant): number {
  // Winding percentages across the path column (Duolingo-like zigzag)
  const classic = [50, 28, 50, 72, 50, 28, 50, 72];
  const pro = [50, 34, 66, 40, 60, 32, 68, 50];
  const series = variant === "pro" ? pro : classic;
  return series[idx % series.length];
}

function LockIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="5" y="10" width="14" height="10" rx="2" fill="#afafaf" />
      <path
        d="M8 10V7a4 4 0 0 1 8 0v3"
        stroke="#afafaf"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.8 6.8 19.6l1-5.8L3.5 9.7l5.9-.9L12 3.5z"
        fill="#fff"
      />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden>
      <path d="M8 5.5v13l11-6.5L8 5.5z" fill="#fff" />
    </svg>
  );
}

export function LearnPathNode({
  lesson,
  globalIdx,
  isCurrent,
  variant,
}: {
  lesson: PathLesson;
  globalIdx: number;
  isCurrent: boolean;
  variant: PathVariant;
}) {
  const x = nodeX(globalIdx, variant);
  const size = variant === "pro" ? "h-[68px] w-[68px]" : "h-[84px] w-[84px]";
  const border = variant === "pro" ? "border-b-[6px]" : "border-b-8";

  const nodeInner = lesson.locked ? (
    <div
      className={`${size} flex items-center justify-center rounded-full border-[3px] border-[#e5e5e5] bg-[#e5e5e5] shadow-[0_4px_0_#d0d0d0]`}
      aria-label={`${lesson.title} locked`}
      title="Complete the previous lesson to unlock"
    >
      <LockIcon />
    </div>
  ) : (
    <Link
      to={`/learn/lesson/${lesson.id}`}
      aria-current={isCurrent ? "step" : undefined}
      aria-label={`${lesson.title}${lesson.completed ? " completed" : isCurrent ? " start" : ""}`}
      className={`${size} ${border} flex items-center justify-center rounded-full text-white transition active:translate-y-1 active:border-b-4 ${
        lesson.completed
          ? "border-[#46a302] bg-[#58cc02] shadow-[0_0_0_4px_#d7ffb8]"
          : isCurrent
            ? "learn-path-current border-[#1899d6] bg-[#1cb0f6]"
            : "border-[#1899d6] bg-[#1cb0f6] hover:brightness-105"
      }`}
    >
      {lesson.completed ? <StarIcon /> : <PlayIcon />}
    </Link>
  );

  return (
    <li
      className="relative"
      style={{
        marginLeft: `calc(${x}% - ${variant === "pro" ? 34 : 42}px)`,
        marginBottom: variant === "pro" ? 28 : 40,
      }}
    >
      {isCurrent && !lesson.locked ? (
        <div className="absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-xl border-2 border-[#e5e5e5] bg-white px-3 py-1 text-xs font-black uppercase tracking-wide text-[#1cb0f6] shadow-sm">
          {lesson.hasActiveSession ? "Resume" : "Start"}
          <span className="absolute left-1/2 top-full -translate-x-1/2 border-8 border-transparent border-t-white" />
        </div>
      ) : null}
      {nodeInner}
      <div
        className={`mt-2 text-center font-extrabold leading-tight text-[#3c3c3c] ${
          variant === "pro" ? "max-w-[90px] text-[13px]" : "max-w-[110px] text-sm"
        }`}
        style={{ width: variant === "pro" ? 90 : 110, marginLeft: -8 }}
      >
        {lesson.title}
        <div className="text-[11px] font-bold text-[#afafaf]">
          {lesson.completed && lesson.stars > 0
            ? "★".repeat(lesson.stars)
            : `+${lesson.xpReward} XP`}
        </div>
      </div>
    </li>
  );
}

function UnitBanner({
  unit,
  title,
  done,
  total,
  variant,
}: {
  unit: number;
  title: string;
  done: number;
  total: number;
  variant: PathVariant;
}) {
  return (
    <div
      className={`relative z-10 mb-2 flex items-center justify-between gap-3 rounded-2xl bg-[#58cc02] text-white shadow-[0_4px_0_#46a302] ${
        variant === "pro" ? "px-3 py-2.5" : "px-4 py-3"
      }`}
    >
      <div>
        <div className="text-[11px] font-black uppercase tracking-[0.12em] text-white/80">
          Unit {unit}
        </div>
        <div className={`font-black ${variant === "pro" ? "text-base" : "text-lg"}`}>
          {title}
        </div>
      </div>
      <div className="rounded-xl bg-white/20 px-2.5 py-1 text-xs font-black">
        {done}/{total}
      </div>
    </div>
  );
}

const UNIT_TITLES: Record<number, string> = {
  1: "Spanish Basics",
  2: "Everyday Words",
};

export function LearnPath({
  lessons,
  variant: variantProp,
}: {
  lessons: PathLesson[];
  variant?: PathVariant;
}) {
  const hookVariant = usePathVariant();
  const variant = variantProp ?? hookVariant;

  const units = lessons.reduce<Record<number, PathLesson[]>>((acc, l) => {
    (acc[l.unitOrder] ||= []).push(l);
    return acc;
  }, {});

  const currentId =
    lessons.find((l) => !l.locked && !l.completed)?.id ??
    lessons.find((l) => l.hasActiveSession)?.id ??
    null;

  let globalIdx = 0;

  return (
    <div
      className={`relative ${variant === "pro" ? "mt-5" : "mt-7"}`}
      data-path-variant={variant}
    >
      {/* soft path atmosphere */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_top,#d7ffb8_0%,transparent_70%)]"
        aria-hidden
      />

      {Object.entries(units).map(([unit, items], unitIndex) => {
        const unitNum = Number(unit);
        const doneCount = items.filter((l) => l.completed).length;
        const startIdx = globalIdx;
        return (
          <section
            key={unit}
            className={`relative ${variant === "pro" ? "mb-6" : "mb-10"}`}
            aria-labelledby={`unit-${unit}`}
          >
            <div id={`unit-${unit}`}>
              <UnitBanner
                unit={unitNum}
                title={UNIT_TITLES[unitNum] ?? `Unit ${unitNum}`}
                done={doneCount}
                total={items.length}
                variant={variant}
              />
            </div>

            <div className="relative pt-6">
              {/* winding path spine */}
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden
              >
                <path
                  d={
                    variant === "pro"
                      ? "M50 0 C34 12, 34 20, 50 28 C66 36, 66 44, 40 56 C32 64, 32 72, 60 84 C68 90, 68 96, 50 100"
                      : "M50 0 C28 14, 28 22, 50 32 C72 42, 72 52, 50 62 C28 72, 28 82, 50 92 C60 96, 60 98, 50 100"
                  }
                  fill="none"
                  stroke="#e5e5e5"
                  strokeWidth={variant === "pro" ? 2.2 : 2.8}
                  vectorEffect="non-scaling-stroke"
                  strokeLinecap="round"
                />
              </svg>

              {unitIndex === 0 ? (
                <div
                  className="pointer-events-none absolute right-1 top-2 z-[1] sm:right-2"
                  aria-hidden
                >
                  <PathMascot className={variant === "pro" ? "opacity-90 scale-90" : ""} />
                </div>
              ) : null}

              <ul className="relative z-[1] list-none p-0">
                {items.map((lesson, idx) => {
                  const g = startIdx + idx;
                  globalIdx += 1;
                  return (
                    <LearnPathNode
                      key={lesson.id}
                      lesson={lesson}
                      globalIdx={g}
                      isCurrent={lesson.id === currentId}
                      variant={variant}
                    />
                  );
                })}
              </ul>
            </div>
          </section>
        );
      })}
    </div>
  );
}
