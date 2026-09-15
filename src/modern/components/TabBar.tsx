import { CloudSun, MagnifyingGlass, Star } from "@phosphor-icons/react";

export type Tab = "weather" | "search" | "favorites";

const TABS: Array<{ id: Tab; label: string; Icon: typeof CloudSun }> = [
  { id: "weather", label: "Wetter", Icon: CloudSun },
  { id: "search", label: "Suche", Icon: MagnifyingGlass },
  { id: "favorites", label: "Favoriten", Icon: Star },
];

export function TabBar({
  active,
  onChange,
  favoriteCount,
}: {
  active: Tab;
  onChange: (tab: Tab) => void;
  favoriteCount: number;
}) {
  return (
    <nav
      aria-label="Hauptnavigation"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/70 bg-white/90 pb-safe-bottom backdrop-blur-md md:inset-y-0 md:right-auto md:w-24 md:border-r md:border-t-0 md:pt-safe-top"
    >
      <ul className="mx-auto flex h-16 max-w-md items-stretch justify-around md:h-full md:max-w-none md:flex-col md:justify-start md:gap-2 md:px-2 md:pt-6">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = id === active;
          return (
            <li key={id} className="flex flex-1 md:flex-none">
              <button
                type="button"
                onClick={() => onChange(id)}
                aria-current={isActive ? "page" : undefined}
                className={`relative flex min-h-[44px] flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 text-[11px] font-medium transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-600 active:scale-[0.94] md:min-h-[64px] ${
                  isActive ? "text-brand-600" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <span
                  className={`grid h-8 w-14 place-items-center rounded-full transition duration-200 ${
                    isActive ? "bg-brand-100" : ""
                  }`}
                >
                  <Icon size={24} weight={isActive ? "fill" : "regular"} aria-hidden="true" />
                </span>
                {label}
                {id === "favorites" && favoriteCount > 0 ? (
                  <span className="absolute right-1/2 top-1 grid h-4 min-w-[16px] translate-x-[26px] place-items-center rounded-full bg-brand-600 px-1 text-[10px] font-semibold text-white">
                    {favoriteCount}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
