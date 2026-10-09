import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary:
    "bg-wt-primary text-white shadow-md hover:bg-wt-primary-deep border-b-4 border-wt-primary-deep active:border-b-2 active:translate-y-0.5",
  secondary:
    "bg-wt-accent text-wt-ink shadow-md hover:bg-wt-accent-warm border-b-4 border-amber-600 active:border-b-2 active:translate-y-0.5",
  ghost: "bg-transparent text-wt-primary hover:bg-wt-primary-soft",
  danger: "bg-wt-error text-white hover:opacity-90",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
  fullWidth?: boolean;
};

export function Button({
  variant = "primary",
  children,
  fullWidth,
  className = "",
  ...rest
}: Props) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 font-display text-base font-bold transition-transform hover:scale-105 disabled:scale-100 disabled:opacity-50 ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
