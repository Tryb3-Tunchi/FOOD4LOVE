import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: Props) {
  return (
    <div
      className={[
        "rounded-2xl border border-black/10 bg-white/78 text-slate-900 shadow-[0_18px_40px_-18px_rgba(2,6,23,0.18)] backdrop-blur dark:border-white/14 dark:bg-white/8 dark:text-zinc-100 dark:shadow-[0_18px_40px_-18px_rgba(0,0,0,0.75)]",
        className ?? "",
      ].join(" ")}
      {...props}
    />
  );
}
