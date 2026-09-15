import { ArrowClockwise, CloudSun, CloudWarning, MagnifyingGlass, Star } from "@phosphor-icons/react";
import { useMemo } from "react";
import type { LoadState } from "../../hooks/useWeatherApp";
import { formatAltitude } from "../../lib/format";
import { getSeriesStats } from "../../lib/series";
import type { Station, TemperatureSeries } from "../../types";
import { EmptyState, PrimaryButton } from "./EmptyState";
import { HeroCard } from "./HeroCard";
import { IconButton } from "./IconButton";
import { WeatherSkeleton } from "./Skeleton";
import { StationChips } from "./StationChips";
import { StatsRow } from "./StatsRow";
import { TrendChart } from "./TrendChart";

export function WeatherScreen({
  station,
  series,
  dataState,
  isFavorite,
  favorites,
  recents,
  onToggleFavorite,
  onRefresh,
  onSelect,
  onOpenSearch,
}: {
  station: Station | null;
  series: TemperatureSeries | null;
  dataState: LoadState;
  isFavorite: boolean;
  favorites: Station[];
  recents: Station[];
  onToggleFavorite: (station: Station) => void;
  onRefresh: () => void;
  onSelect: (station: Station) => void;
  onOpenSearch: () => void;
}) {
  const stats = useMemo(() => getSeriesStats(series), [series]);
  const loading = dataState === "loading";

  if (!station) {
    return (
      <div className="px-4 pt-6">
        <EmptyState
          icon={<CloudSun size={32} weight="duotone" />}
          title="Wähle eine Station"
          text="Suche einen Ort oder eine GeoSphere-Messstation. Danach siehst du hier die aktuelle Lufttemperatur und den Verlauf der letzten 24 Stunden."
          action={
            <PrimaryButton onClick={onOpenSearch}>
              <MagnifyingGlass size={18} weight="bold" aria-hidden="true" />
              Station suchen
            </PrimaryButton>
          }
        />
      </div>
    );
  }

  const favoriteLabel = isFavorite ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen";

  return (
    <>
      <header className="sticky top-0 z-20 bg-surface/85 pt-safe-top backdrop-blur-md">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <h1 className="line-clamp-2 text-[20px] font-bold leading-tight tracking-tight text-slate-900">{station.name}</h1>
            <p className="truncate text-[13px] text-slate-500">
              {station.state} · {formatAltitude(station.altitude)}
            </p>
          </div>
          <IconButton label={favoriteLabel} active={isFavorite} onClick={() => onToggleFavorite(station)} aria-pressed={isFavorite}>
            <Star size={22} weight={isFavorite ? "fill" : "regular"} className={isFavorite ? "text-amber-500" : ""} aria-hidden="true" />
          </IconButton>
          <IconButton label="Daten neu laden" onClick={onRefresh} disabled={loading}>
            <ArrowClockwise size={22} weight="bold" className={loading ? "animate-spin" : ""} aria-hidden="true" />
          </IconButton>
        </div>
      </header>

      <div className="space-y-4 px-4 pt-1">
        <StationChips favorites={favorites} recents={recents} selectedId={station.id} onSelect={onSelect} />

        {loading && !series ? <WeatherSkeleton /> : null}

        {dataState === "empty" ? (
          <EmptyState
            icon={<CloudWarning size={32} weight="duotone" />}
            title="Keine Messwerte"
            text="GeoSphere hat für diese Station im aktuellen 24-Stunden-Fenster keine Temperaturreihe geliefert."
          />
        ) : null}

        {dataState === "error" ? (
          <EmptyState
            icon={<CloudWarning size={32} weight="duotone" />}
            title="Daten nicht verfügbar"
            text="Bitte wähle eine andere Station oder versuche es später erneut."
            action={
              <PrimaryButton onClick={onRefresh}>
                <ArrowClockwise size={18} weight="bold" aria-hidden="true" />
                Erneut versuchen
              </PrimaryButton>
            }
          />
        ) : null}

        {(dataState === "ready" || loading) && series ? (
          <div className={`space-y-4 transition-opacity duration-200 ${loading ? "opacity-60" : ""}`}>
            <HeroCard series={series} />
            <StatsRow stats={stats} unit={series.unit} />
            {series.points.some((point) => point.value !== null) ? (
              <TrendChart points={series.points} unit={series.unit} stats={stats} />
            ) : null}
          </div>
        ) : null}
      </div>
    </>
  );
}
