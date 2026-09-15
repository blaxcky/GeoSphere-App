import { Check, Star } from "@phosphor-icons/react";
import { formatAltitude } from "../../lib/format";
import type { Station } from "../../types";

export function StationRow({
  station,
  active,
  isFavorite,
  onSelect,
  onToggleFavorite,
}: {
  station: Station;
  active: boolean;
  isFavorite: boolean;
  onSelect: (station: Station) => void;
  onToggleFavorite: (station: Station) => void;
}) {
  const favoriteLabel = isFavorite
    ? `${station.name} aus Favoriten entfernen`
    : `${station.name} zu Favoriten hinzufügen`;

  return (
    <li
      className={`flex items-center rounded-2xl pr-1 transition duration-150 ${
        active ? "bg-brand-50" : "bg-white shadow-soft"
      }`}
    >
      <button
        type="button"
        onClick={() => onSelect(station)}
        className="flex min-h-[64px] min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-600 active:opacity-70"
      >
        <span className="min-w-0 flex-1">
          <span className={`block truncate text-[15px] font-semibold ${active ? "text-brand-700" : "text-slate-900"}`}>
            {station.name}
          </span>
          <span className="mt-0.5 block truncate text-[13px] text-slate-500">
            {station.state} · {formatAltitude(station.altitude)}
            {station.type === "COMBINED" ? " · Kombiniert" : ""}
          </span>
        </span>
        {active ? <Check size={20} weight="bold" className="shrink-0 text-brand-600" aria-label="Ausgewählt" /> : null}
      </button>
      <button
        type="button"
        onClick={() => onToggleFavorite(station)}
        aria-label={favoriteLabel}
        aria-pressed={isFavorite}
        title={favoriteLabel}
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-600 active:scale-[0.9] ${
          isFavorite ? "text-amber-500" : "text-slate-300 hover:text-slate-500"
        }`}
      >
        <Star size={22} weight={isFavorite ? "fill" : "regular"} aria-hidden="true" />
      </button>
    </li>
  );
}
