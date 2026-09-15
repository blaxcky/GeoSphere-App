import { MagnifyingGlass, Star } from "@phosphor-icons/react";
import type { Station } from "../../types";
import { EmptyState, PrimaryButton } from "./EmptyState";
import { StationRow } from "./StationRow";

export function FavoritesScreen({
  favorites,
  selectedStation,
  onSelect,
  onToggleFavorite,
  onOpenSearch,
}: {
  favorites: Station[];
  selectedStation: Station | null;
  onSelect: (station: Station) => void;
  onToggleFavorite: (station: Station) => void;
  onOpenSearch: () => void;
}) {
  return (
    <>
      <header className="sticky top-0 z-20 bg-surface/85 pt-safe-top backdrop-blur-md">
        <div className="flex items-baseline justify-between px-4 py-3">
          <h1 className="text-[22px] font-bold tracking-tight text-slate-900">Favoriten</h1>
          {favorites.length > 0 ? <span className="font-mono text-[13px] text-slate-500">{favorites.length}</span> : null}
        </div>
      </header>

      <div className="px-4 pt-1">
        {favorites.length === 0 ? (
          <EmptyState
            icon={<Star size={32} weight="duotone" />}
            title="Noch keine Favoriten"
            text="Markiere Stationen über den Stern, um sie hier schnell wiederzufinden."
            action={
              <PrimaryButton onClick={onOpenSearch}>
                <MagnifyingGlass size={18} weight="bold" aria-hidden="true" />
                Station suchen
              </PrimaryButton>
            }
          />
        ) : (
          <ul className="space-y-2">
            {favorites.map((station) => (
              <StationRow
                key={`favorite-${station.id}`}
                station={station}
                active={selectedStation?.id === station.id}
                isFavorite
                onSelect={onSelect}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
