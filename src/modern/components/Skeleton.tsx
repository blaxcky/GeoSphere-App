export function WeatherSkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <div className="h-24 w-48 animate-pulse rounded-2xl bg-slate-100" />
        <div className="mt-4 h-4 w-40 animate-pulse rounded bg-slate-100" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-24 animate-pulse rounded-3xl bg-white shadow-soft" />
        ))}
      </div>
      <div className="h-[280px] animate-pulse rounded-3xl bg-white shadow-soft" />
    </div>
  );
}

export function ListSkeleton() {
  return (
    <ul className="space-y-2" aria-hidden="true">
      {[0, 1, 2, 3].map((item) => (
        <li key={item} className="h-16 animate-pulse rounded-2xl bg-white shadow-soft" />
      ))}
    </ul>
  );
}
