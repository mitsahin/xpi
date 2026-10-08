import type { ReactNode } from "react";

/** Duolingo-like learn chrome: Nunito, green accents, no marketing atmosphere. */
export function LessonShell({ children }: { children: ReactNode }) {
  return <div className="learn-shell">{children}</div>;
}
