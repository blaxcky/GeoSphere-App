import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  text,
  action,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-3xl bg-white px-6 py-10 text-center shadow-soft">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-brand-50 text-brand-600">{icon}</div>
      <h2 className="mt-5 text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
      <p className="mt-2 max-w-sm text-[15px] leading-6 text-slate-500">{text}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function PrimaryButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-brand-600 px-6 text-[15px] font-semibold text-white shadow-soft transition duration-150 hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 active:scale-[0.97]"
    >
      {children}
    </button>
  );
}
