import { Mascot } from "@/components/Mascot";

export function Header() {
  return (
    <header className="mb-1 flex items-center gap-2 sm:mb-2">
      <Mascot variant="logo" />
      <span className="whitespace-nowrap text-[1.55rem] font-extrabold tracking-[-0.03em] text-brand-navy sm:text-[1.9rem]">
        walky talky
      </span>
    </header>
  );
}
