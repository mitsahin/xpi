import { useEffect } from "react";
import { api } from "../lib/api";
import { BottomNav } from "../components/BottomNav";
import { TopStats } from "../components/TopStats";
import { useAppStore } from "../store";

export function ProfilePage() {
  const user = useAppStore((s) => s.user);
  const streak = useAppStore((s) => s.streak);
  const setUser = useAppStore((s) => s.setUser);
  const setStreak = useAppStore((s) => s.setStreak);
  const logout = useAppStore((s) => s.logout);

  useEffect(() => {
    api.stats().then((s) => {
      setUser(s.user);
      setStreak(s.streak);
    });
  }, [setUser, setStreak]);

  if (!user) return null;

  return (
    <div className="min-h-full bg-white pb-24">
      <TopStats />
      <main className="mx-auto max-w-lg px-4 py-8">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#58cc02] text-3xl font-black text-white">
            {user.displayName.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-black">{user.displayName}</h1>
            <p className="font-bold text-[#777]">{user.email}</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3">
          <Stat label="Level" value={String(user.level)} />
          <Stat label="Total XP" value={String(user.xp)} />
          <Stat label="Streak" value={`${streak?.currentStreak ?? 0} days`} />
          <Stat label="Best streak" value={`${streak?.longestStreak ?? 0} days`} />
          <Stat
            label="Today"
            value={`${streak?.todayXp ?? 0}/${streak?.dailyXpGoal ?? user.dailyXpGoal} XP`}
          />
          <Stat label="Timezone" value={user.timezone} />
        </div>

        <button
          onClick={logout}
          className="mt-10 w-full rounded-2xl border-2 border-[#e5e5e5] py-3 font-black uppercase text-[#777]"
        >
          Log out
        </button>
      </main>
      <BottomNav />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border-2 border-[#e5e5e5] p-4">
      <div className="text-xs font-extrabold uppercase tracking-wide text-[#afafaf]">
        {label}
      </div>
      <div className="mt-1 text-xl font-black">{value}</div>
    </div>
  );
}
