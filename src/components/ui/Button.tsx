import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  leftIcon?: ReactNode;
};

const variantClassName: Record<Variant, string> = {
  primary:
    "border border-black/10 bg-gradient-to-r from-brand-400 via-lime-300 to-punch-500 text-slate-950 shadow-[0_14px_32px_-16px_rgba(245,158,11,0.92)] hover:border-black/20 hover:from-brand-300 hover:via-lime-200 hover:to-punch-400 dark:border-white/12 dark:hover:border-white/20",
  secondary:
    "border border-black/10 bg-white/70 text-slate-900 hover:border-black/20 hover:bg-white/90 dark:border-white/12 dark:bg-white/8 dark:text-zinc-100 dark:hover:border-white/20 dark:hover:bg-white/12",
  danger: "bg-red-500 text-white hover:bg-red-400",
  ghost:
    "border border-transparent bg-transparent text-slate-900 hover:border-black/10 hover:bg-black/5 dark:text-zinc-100 dark:hover:border-white/14 dark:hover:bg-white/12",
};

export function Button({
  className,
  variant = "secondary",
  leftIcon,
  children,
  ...props
}: Props) {
  return (
    <button
      className={[
        "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold tracking-tight transition active:translate-y-[0.5px] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-brand-400/55 disabled:pointer-events-none disabled:opacity-50",
        variantClassName[variant],
        className ?? "",
      ].join(" ")}
      {...props}
    >
      {leftIcon}
      {children}
    </button>
  );
}
