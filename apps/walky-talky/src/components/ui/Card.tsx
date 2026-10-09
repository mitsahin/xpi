import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
};

const pad = { sm: "p-4", md: "p-6", lg: "p-8" };

export function Card({ children, className = "", padding = "md" }: Props) {
  return (
    <div
      className={`rounded-3xl border border-emerald-100/80 bg-wt-card shadow-sm ${pad[padding]} ${className}`}
    >
      {children}
    </div>
  );
}
