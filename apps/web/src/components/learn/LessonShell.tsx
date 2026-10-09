import type { ReactNode } from "react";

export { LearnEmptyState, LearnErrorState, LearnLoading } from "./LearnStates";
export { LearnPath, LearnPathNode } from "./LearnPath";

/** Duolingo-like learn chrome: Nunito, green accents, no marketing atmosphere. */
export function LessonShell({ children }: { children: ReactNode }) {
  return (
    <div className="learn-shell" data-shell="lesson">
      {children}
    </div>
  );
}
