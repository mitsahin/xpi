import { Link } from "react-router-dom";
import { Flame, Snowflake, Star } from "lucide-react";
import { WalkyBeeLogo } from "../brand/WalkyBeeLogo";
import { useWalkyStore } from "../store";

type Props = {
  compact?: boolean;
};

export function WalkyNavbar({ compact }: Props) {
  const { level, streak, freezeCount, xp } = useWalkyStore();

  return (
    <header className="sticky top-0 z-40 border-b border-[#d8ebe0] bg-[#f3fbf6]/94 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 md:px-6">
        <Link
          to="/"
          className="group flex items-center gap-2.5 rounded-[20px] outline-none focus-visible:ring-2 focus-visible:ring-[#2BB673]"
        >
          <WalkyBeeLogo size={compact ? 40 : 48} className="shrink-0 transition-transform group-hover:scale-105" />
          <div className="leading-tight">
            <p className="font-[family-name:var(--font-walky)] text-lg font-extrabold tracking-tight text-[#143528]">
              Walky Talky
            </p>
            {!compact && (
              <p className="text-xs font-semibold text-[#5a7a68]">Yeni frekans</p>
            )}
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className="flex items-center gap-1.5 rounded-[20px] bg-white px-3 py-2 shadow-[0_3px_0_#d8ebe0]"
            title={`Seviye ${level} · ${xp} XP`}
          >
            <Star className="size-4 fill-[#FFB020] text-[#FFB020]" aria-hidden />
            <span className="text-sm font-extrabold text-[#143528]">Sv. {level}</span>
          </div>

          <div
            className="flex items-center gap-1.5 rounded-[20px] bg-[#FFF4E5] px-3 py-2 shadow-[0_3px_0_#f0d4a8]"
            title={`${streak} günlük streak`}
          >
            <Flame className="size-4 fill-[#FF6B2C] text-[#FF6B2C]" aria-hidden />
            <span className="text-sm font-extrabold text-[#9a3f12]">{streak}</span>
          </div>

          <div
            className="relative flex items-center gap-1.5 rounded-[20px] bg-[#E8F4FF] px-3 py-2 shadow-[0_3px_0_#b8d4ea]"
            title={`Streak Freeze: ${freezeCount}`}
          >
            <Snowflake className="size-4 text-[#1CB0F6]" aria-hidden />
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#1CB0F6] px-1 text-[10px] font-black text-white">
              {freezeCount}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
