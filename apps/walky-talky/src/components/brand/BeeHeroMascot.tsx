import { BeeWalkieLogo } from "./BeeWalkieLogo";

export function BeeHeroMascot() {
  return (
    <div className="relative mx-auto flex h-56 w-56 items-center justify-center md:h-72 md:w-72">
      <div className="absolute inset-0 rounded-full bg-linear-to-br from-wt-primary-soft to-amber-100 opacity-80" />
      <div className="absolute inset-4 rounded-full border-4 border-dashed border-wt-primary/30" />
      <div className="wt-float relative">
        <BeeWalkieLogo size={140} />
      </div>
      <span className="absolute -right-2 top-4 rotate-12 rounded-2xl bg-wt-accent px-3 py-1 font-display text-sm font-bold text-wt-ink shadow-md">
        CH 7
      </span>
    </div>
  );
}
