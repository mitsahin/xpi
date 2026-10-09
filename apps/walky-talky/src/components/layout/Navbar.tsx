import { Link, useLocation } from "react-router-dom";
import { Flame, Snowflake } from "lucide-react";
import { BeeWalkieLogo } from "../brand/BeeWalkieLogo";
import { useProgressStore } from "../../store/progressStore";

export function Navbar() {
  const { streak, level, streakFreeze } = useProgressStore();
  const loc = useLocation();
  const onLanding = loc.pathname === "/";

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-100/80 bg-wt-card/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link to="/" className="flex items-center gap-2 transition hover:opacity-90">
          <BeeWalkieLogo size={40} />
          <span className="font-display text-lg font-extrabold tracking-tight text-wt-ink md:text-xl">
            Walky Talky
          </span>
        </Link>

        {!onLanding && (
          <div className="flex items-center gap-3 md:gap-5">
            <div
              className="flex items-center gap-1 rounded-2xl bg-amber-50 px-3 py-1.5 font-display font-bold text-amber-700"
              title="Seri"
            >
              <Flame className="h-5 w-5 text-orange-500" aria-hidden />
              <span>{streak}</span>
            </div>
            <div
              className="flex items-center gap-1 rounded-2xl bg-sky-50 px-3 py-1.5 text-sm font-semibold text-sky-800"
              title="Seri dondurma"
            >
              <Snowflake className="h-4 w-4 text-sky-500" aria-hidden />
              <span>{streakFreeze}</span>
            </div>
            <div className="hidden rounded-2xl bg-wt-primary-soft px-3 py-1.5 font-display font-bold text-wt-primary-deep sm:block">
              Sv. {level}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
