import { useAppStore } from "../store";

export function TopStats() {
  const user = useAppStore((s) => s.user);
  const streak = useAppStore((s) => s.streak);
  if (!user) return null;
  const todayXp = streak?.todayXp ?? 0;
  const goal = streak?.dailyXpGoal ?? user.dailyXpGoal;
  const pct = Math.min(100, Math.round((todayXp / Math.max(1, goal)) * 100));

  return (
    <header className="sticky top-0 z-20 border-b-2 border-[#e5e5e5] bg-white px-3 py-2.5">
      <div className="mx-auto flex max-w-md items-center justify-between gap-2">
        <div className="text-[1.35rem] font-black tracking-tight text-[#58cc02]">
          x-pi
        </div>
        <div className="flex items-center gap-3 text-[15px] font-extrabold">
          <span className="inline-flex items-center gap-1 text-[#ff9600]" title="Streak">
            <span aria-hidden>🔥</span>
            {streak?.currentStreak ?? 0}
          </span>
          <span className="inline-flex items-center gap-1 text-[#1cb0f6]" title="XP">
            <span aria-hidden>⚡</span>
            {user.xp}
          </span>
          <span className="inline-flex items-center gap-1 text-[#ff4b4b]" title="Hearts">
            <span aria-hidden>❤</span>
            {user.hearts}
          </span>
        </div>
      </div>
      <div className="mx-auto mt-2 max-w-md">
        <div className="mb-1 flex justify-between text-[11px] font-bold uppercase tracking-wide text-[#afafaf]">
          <span>Daily goal</span>
          <span>
            {todayXp}/{goal} XP
          </span>
        </div>
        <div className="h-3.5 overflow-hidden rounded-full bg-[#e5e5e5]">
          <div
            className="h-full rounded-full bg-[#58cc02] transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </header>
  );
}
