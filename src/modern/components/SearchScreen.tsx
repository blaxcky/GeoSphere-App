import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { useEffect, useRef } from "react";
import type { LoadState } from "../../hooks/useWeatherApp";
import type { Station } from "../../types";
import { ListSkeleton } from "./Skeleton";
import { StationRow } from "./StationRow";

export function SearchScreen({
  query,
  onQueryChange,
  stations,
  searchState,
  recents,
  selectedStation,
  favoriteIds,
  onSelect,
  onToggleFavorite,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  stations: Station[];
  searchState: LoadState;
  recents: Station[];
  selectedStation: Station | null;
  favoriteIds: Set<string>;
  onSelect: (station: Station) => void;
  onToggleFavorite: (station: Station) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  const renderList = (items: Station[]) => (
    <ul className="space-y-2">
      {items.map((station) => (
        <StationRow
          key={`${station.type}-${station.id}`}
          station={station}
          active={selectedStation?.id === station.id}
          isFavorite={favoriteIds.has(station.id)}
          onSelect={onSelect}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </ul>
  );

  return (
    <>
      <header className="sticky top-0 z-20 bg-surface/85 pt-safe-top backdrop-blur-md">
        <div className="px-4 pb-3 pt-3">
          <h1 className="text-[22px] font-bold tracking-tight text-slate-900">Suche</h1>
          <label htmlFor="modern-station-search" className="sr-only">
            Ort oder Stationsname
          </label>
          <div className="relative mt-3">
            <MagnifyingGlass
              size={20}
              weight="bold"
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              ref={inputRef}
              id="modern-station-search"
              type="search"
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Graz, Wien, Linz …"
              className="h-14 w-full rounded-2xl bg-white pl-12 pr-12 text-base text-slate-900 shadow-soft outline-none transition duration-150 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-600 [&::-webkit-search-cancel-button]:hidden"
            />
            {query ? (
              <button
                type="button"
                onClick={() => {
                  onQueryChange("");
                  inputRef.current?.focus();
                }}
                aria-label="Suche leeren"
                className="absolute right-1.5 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-xl text-slate-400 transition hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 active:scale-[0.9]"
              >
                <X size={18} weight="bold" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <div className="px-4 pt-1">
        {searchState === "idle" ? (
          <>
            <p className="px-1 text-[13px] text-slate-500">Mindestens zwei Zeichen eingeben.</p>
            {recents.length > 0 ? (
              <section aria-labelledby="recent-heading" className="mt-5">
                <h2 id="recent-heading" className="px-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Zuletzt angesehen
                </h2>
                <div className="mt-2">{renderList(recents)}</div>
              </section>
            ) : null}
          </>
        ) : null}

        {searchState === "loading" ? <ListSkeleton /> : null}

        {searchState === "empty" ? (
          <p className="rounded-2xl bg-white px-4 py-4 text-[15px] text-slate-600 shadow-soft">
            Keine aktive GeoSphere-Station für diese Suche gefunden.
          </p>
        ) : null}

        {searchState === "ready" ? renderList(stations) : null}
      </div>
    </>
  );
}
