import { useAppStore } from "../store";

export function TopStats() {
  const user = useAppStore((s) => s.user);
  const streak = useAppStore((s) => s.streak);
  if (!user) return null;
  const todayXp = streak?.todayXp ?? 0;
  const goal = streak?.dailyXpGoal ?? user.dailyXpGoal;
  const pct = Math.min(100, Math.round((todayXp / Math.max(1, goal)) * 100));

  return (
    <header className="sticky top-0 z-10 border-b border-[#e5e5e5] bg-white/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
        <div className="text-2xl font-black tracking-tight text-[#58cc02]">x-pi</div>
        <div className="flex items-center gap-3 text-sm font-extrabold">
          <span className="text-[#ff9600]">🔥 {streak?.currentStreak ?? 0}</span>
          <span className="text-[#ce82ff]" title="Streak freezes">
            ❄️ {streak?.freezesAvailable ?? 0}
          </span>
          <span className="text-[#1cb0f6]">💎 {user.xp} XP</span>
          <span className="text-[#ff4b4b]">❤ {user.hearts}</span>
        </div>
      </div>
      <div className="mx-auto mt-2 max-w-lg">
        <div className="mb-1 flex justify-between text-xs font-bold text-[#777]">
          <span>Daily goal</span>
          <span>
            {todayXp}/{goal} XP
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-[#e5e5e5]">
          <div
            className="h-full rounded-full bg-[#58cc02] transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </header>
  );
}
