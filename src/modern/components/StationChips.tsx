import { Star } from "@phosphor-icons/react";
import { useEffect, useRef } from "react";
import type { Station } from "../../types";

export function StationChips({
  favorites,
  recents,
  selectedId,
  onSelect,
}: {
  favorites: Station[];
  recents: Station[];
  selectedId: string | null;
  onSelect: (station: Station) => void;
}) {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const active = listRef.current?.querySelector<HTMLElement>('[aria-pressed="true"]');
    active?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [selectedId]);

  const seen = new Set<string>();
  const items: Array<{ station: Station; favorite: boolean }> = [];
  for (const station of favorites) {
    if (seen.has(station.id)) continue;
    seen.add(station.id);
    items.push({ station, favorite: true });
  }
  for (const station of recents) {
    if (seen.has(station.id)) continue;
    seen.add(station.id);
    items.push({ station, favorite: false });
  }
  const shown = items.slice(0, 8);
  if (shown.length < 2) return null;

  return (
    <div className="-mx-4 px-4">
      <ul
        ref={listRef}
        aria-label="Schnellwahl Stationen"
        className="no-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain pb-1 touch-pan-x"
      >
        {shown.map(({ station, favorite }) => {
          const active = station.id === selectedId;
          return (
            <li key={station.id} className="snap-start">
              <button
                type="button"
                onClick={() => onSelect(station)}
                aria-pressed={active}
                className={`flex min-h-[44px] max-w-[220px] items-center gap-1.5 whitespace-nowrap rounded-2xl px-4 text-[14px] font-medium transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 active:scale-[0.96] ${
                  active ? "bg-brand-600 text-white shadow-soft" : "bg-white text-slate-700 shadow-soft hover:text-brand-600"
                }`}
              >
                {favorite ? (
                  <Star size={14} weight="fill" aria-hidden="true" className={active ? "text-white" : "text-amber-500"} />
                ) : null}
                <span className="truncate">{station.name}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
