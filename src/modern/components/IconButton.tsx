import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  active?: boolean;
};

export function IconButton({ label, active = false, className = "", children, ...rest }: Props) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 active:scale-[0.94] disabled:cursor-not-allowed disabled:opacity-40 ${
        active ? "bg-brand-50 text-brand-600" : "bg-white text-slate-600 shadow-soft hover:text-brand-600"
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
