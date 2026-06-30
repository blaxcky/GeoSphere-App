import { useEffect, useMemo, useState } from "react";
import {
  ArrowClockwise,
  ChartLineUp,
  CloudWarning,
  MagnifyingGlass,
  MapPin,
  Mountains,
  ThermometerSimple,
} from "@phosphor-icons/react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getTemperatureSeries, searchStations } from "./api/geosphere";
import type { Station, TemperaturePoint, TemperatureSeries } from "./types";

type LoadState = "idle" | "loading" | "ready" | "empty" | "error";
const RECENT_STATIONS_KEY = "geosphere-recent-stations";
const MAX_RECENT_STATIONS = 3;

const numberFormat = new Intl.NumberFormat("de-AT", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});

const dateTimeFormat = new Intl.DateTimeFormat("de-AT", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatTemperature(value: number | null | undefined) {
  return typeof value === "number" ? numberFormat.format(value) : "Keine Daten";
}

function formatAltitude(value: number | null) {
  return typeof value === "number" ? `${Math.round(value)} m` : "n/a";
}

function readRecentStations(): Station[] {
  try {
    const raw = window.localStorage.getItem(RECENT_STATIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Station[];
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((station): station is Station => Boolean(station?.id && station?.name))
      .slice(0, MAX_RECENT_STATIONS);
  } catch {
    return [];
  }
}

function writeRecentStations(stations: Station[]) {
  window.localStorage.setItem(RECENT_STATIONS_KEY, JSON.stringify(stations.slice(0, MAX_RECENT_STATIONS)));
}

function addRecentStation(stations: Station[], station: Station) {
  return [station, ...stations.filter((item) => item.id !== station.id)].slice(0, MAX_RECENT_STATIONS);
}

function SearchSkeleton() {
  return (
    <div className="space-y-2">
      {[0, 1, 2].map((item) => (
        <div key={item} className="h-14 animate-pulse rounded-lg bg-zinc-100" />
      ))}
    </div>
  );
}

function DataSkeleton() {
  return (
    <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="rounded-lg border border-zinc-200 bg-white p-6">
        <div className="h-4 w-28 animate-pulse rounded bg-zinc-100" />
        <div className="mt-7 h-20 w-56 animate-pulse rounded bg-zinc-100" />
        <div className="mt-8 grid grid-cols-2 gap-3">
          <div className="h-16 animate-pulse rounded bg-zinc-100" />
          <div className="h-16 animate-pulse rounded bg-zinc-100" />
        </div>
      </div>
      <div className="min-h-[360px] rounded-lg border border-zinc-200 bg-white p-6">
        <div className="h-full min-h-[300px] animate-pulse rounded bg-zinc-100" />
      </div>
    </div>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-zinc-600">
      <CloudWarning size={28} weight="duotone" className="text-accent-700" />
      <h2 className="mt-4 text-lg font-semibold tracking-tight text-zinc-950">{title}</h2>
      <p className="mt-2 max-w-xl text-sm leading-6">{text}</p>
    </div>
  );
}

function StationList({
  stations,
  selectedStation,
  onSelect,
}: {
  stations: Station[];
  selectedStation: Station | null;
  onSelect: (station: Station) => void;
}) {
  if (stations.length === 0) return null;

  return (
    <div className="mt-3 max-h-80 overflow-auto rounded-lg border border-zinc-200 bg-white shadow-[0_18px_40px_-28px_rgba(24,24,27,0.28)]">
      {stations.map((station, index) => {
        const active = selectedStation?.id === station.id;
        return (
          <button
            key={`${station.type}-${station.id}`}
            type="button"
            onClick={() => onSelect(station)}
            className="flex w-full items-center justify-between gap-4 border-b border-zinc-100 px-4 py-3 text-left transition duration-200 last:border-b-0 hover:bg-zinc-50 active:translate-y-[1px]"
            style={{ animationDelay: `${index * 35}ms` }}
          >
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-zinc-950">{station.name}</span>
              <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
                <span>{station.state}</span>
                <span>{formatAltitude(station.altitude)}</span>
                <span>{station.type === "COMBINED" ? "Kombiniert" : "Station"}</span>
              </span>
            </span>
            <span
              className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                active ? "bg-accent-600" : "bg-zinc-200"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

function RecentStations({
  stations,
  selectedStation,
  onSelect,
}: {
  stations: Station[];
  selectedStation: Station | null;
  onSelect: (station: Station) => void;
}) {
  if (stations.length === 0) return null;

  return (
    <div className="mt-5 border-t border-zinc-200 pt-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
          Letzte Stationen
        </h2>
        <span className="font-mono text-xs text-zinc-400">{stations.length}/3</span>
      </div>
      <div className="mt-3 grid gap-2">
        {stations.map((station) => {
          const active = selectedStation?.id === station.id;
          return (
            <button
              key={`recent-${station.id}`}
              type="button"
              onClick={() => onSelect(station)}
              className={`rounded-lg border px-3 py-3 text-left transition duration-200 active:translate-y-[1px] ${
                active
                  ? "border-accent-600 bg-accent-50 text-accent-700"
                  : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-300 hover:bg-white"
              }`}
            >
              <span className="block truncate text-sm font-medium">{station.name}</span>
              <span className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-xs text-zinc-500">
                <span>{station.state}</span>
                <span>{formatAltitude(station.altitude)}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="border-t border-zinc-200 pt-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-zinc-500">
        {icon}
        {label}
      </div>
      <div className="mt-2 truncate font-mono text-sm font-semibold text-zinc-950">{value}</div>
    </div>
  );
}

function TemperatureChart({ points, unit }: { points: TemperaturePoint[]; unit: string }) {
  const usablePoints = useMemo(
    () =>
      points.map((point) => ({
        ...point,
        displayValue: point.value,
      })),
    [points],
  );

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-zinc-950">Temperaturverlauf</h2>
          <p className="mt-1 text-sm text-zinc-500">10-Minuten-Messwerte der letzten 24 Stunden</p>
        </div>
        <ChartLineUp size={24} weight="duotone" className="shrink-0 text-accent-700" />
      </div>
      <div className="h-[320px] min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={usablePoints} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="temperatureFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#e4e4e7" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="timeLabel"
              minTickGap={34}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#71717a", fontSize: 12 }}
            />
            <YAxis
              width={42}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#71717a", fontSize: 12 }}
              tickFormatter={(value) => `${value}${unit}`}
              domain={["dataMin - 1", "dataMax + 1"]}
            />
            <Tooltip
              cursor={{ stroke: "#0f766e", strokeWidth: 1 }}
              contentStyle={{
                border: "1px solid #e4e4e7",
                borderRadius: 8,
                boxShadow: "0 18px 40px -28px rgba(24,24,27,0.35)",
              }}
              labelFormatter={(_, payload) => {
                const point = payload?.[0]?.payload as TemperaturePoint | undefined;
                return point ? dateTimeFormat.format(new Date(point.timestamp)) : "";
              }}
              formatter={(value) => [`${numberFormat.format(Number(value))} ${unit}`, "Temperatur"]}
            />
            <Area
              type="monotone"
              dataKey="displayValue"
              stroke="#0f766e"
              strokeWidth={2}
              fill="url(#temperatureFill)"
              connectNulls={false}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0, fill: "#0f766e" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function WeatherPanel({
  station,
  series,
  onRefresh,
  loading,
}: {
  station: Station;
  series: TemperatureSeries;
  onRefresh: () => void;
  loading: boolean;
}) {
  const latest = series.latest;

  return (
    <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
      <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-[0_22px_50px_-38px_rgba(24,24,27,0.32)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-700">Aktuell</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">{station.name}</h1>
            <p className="mt-1 text-sm text-zinc-500">{station.state}</p>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="rounded-md border border-zinc-200 p-2 text-zinc-600 transition duration-200 hover:border-accent-600 hover:text-accent-700 active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-50"
            title="Daten neu laden"
          >
            <ArrowClockwise size={20} weight="bold" className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="mt-8 flex items-end gap-3">
          <ThermometerSimple size={42} weight="duotone" className="mb-3 text-accent-700" />
          <div className="font-mono text-6xl font-semibold tracking-tight text-zinc-950 sm:text-7xl">
            {formatTemperature(latest?.value)}
          </div>
          {latest ? <div className="mb-3 font-mono text-2xl text-zinc-500">{series.unit}</div> : null}
        </div>

        <p className="mt-4 text-sm text-zinc-500">
          {latest
            ? `Letzter gültiger Messwert: ${dateTimeFormat.format(new Date(latest.timestamp))}`
            : "Im ausgewählten 24-Stunden-Fenster wurde kein gültiger Temperaturwert gefunden."}
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Metric icon={<MapPin size={16} weight="bold" />} label="Koordinaten" value={`${station.lat ?? "n/a"}, ${station.lon ?? "n/a"}`} />
          <Metric icon={<Mountains size={16} weight="bold" />} label="Höhe" value={formatAltitude(station.altitude)} />
        </div>
      </section>

      {series.points.some((point) => point.value !== null) ? (
        <TemperatureChart points={series.points} unit={series.unit} />
      ) : (
        <EmptyState
          title="Keine Temperaturdaten"
          text="Die Station wurde gefunden, aber GeoSphere liefert für die letzten 24 Stunden keine Lufttemperaturwerte."
        />
      )}
    </div>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [recentStations, setRecentStations] = useState<Station[]>([]);
  const [series, setSeries] = useState<TemperatureSeries | null>(null);
  const [searchState, setSearchState] = useState<LoadState>("idle");
  const [dataState, setDataState] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedStations = readRecentStations();
    setRecentStations(savedStations);
    if (savedStations[0]) {
      setSelectedStation(savedStations[0]);
      setQuery(savedStations[0].name);
    }
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    setError(null);

    if (trimmed.length < 2) {
      setStations([]);
      setSearchState("idle");
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      setSearchState("loading");
      searchStations(trimmed, controller.signal)
        .then((result) => {
          setStations(result);
          setSearchState(result.length > 0 ? "ready" : "empty");
        })
        .catch((caught: unknown) => {
          if (caught instanceof DOMException && caught.name === "AbortError") return;
          setSearchState("error");
          setError(caught instanceof Error ? caught.message : "Die Stationssuche ist fehlgeschlagen.");
        });
    }, 350);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    if (!selectedStation) return;

    setRecentStations((current) => {
      const updated = addRecentStation(current, selectedStation);
      writeRecentStations(updated);
      return updated;
    });

    const controller = new AbortController();
    setDataState("loading");
    setError(null);

    getTemperatureSeries(selectedStation.id, controller.signal)
      .then((result) => {
        setSeries(result);
        setDataState(result.points.length > 0 ? "ready" : "empty");
      })
      .catch((caught: unknown) => {
        if (caught instanceof DOMException && caught.name === "AbortError") return;
        setSeries(null);
        setDataState("error");
        setError(caught instanceof Error ? caught.message : "Die Temperaturdaten konnten nicht geladen werden.");
      });

    return () => controller.abort();
  }, [selectedStation]);

  function handleStationSelect(station: Station) {
    setSelectedStation(station);
    setQuery(station.name);
  }

  function handleRefresh() {
    if (!selectedStation) return;
    setDataState("loading");
    getTemperatureSeries(selectedStation.id)
      .then((result) => {
        setSeries(result);
        setDataState(result.points.length > 0 ? "ready" : "empty");
      })
      .catch((caught: unknown) => {
        setDataState("error");
        setError(caught instanceof Error ? caught.message : "Die Temperaturdaten konnten nicht geladen werden.");
      });
  }

  const showInitial = !selectedStation && query.trim().length < 2;

  return (
    <main className="min-h-[100dvh] bg-zinc-50 text-zinc-950">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[360px_1fr] lg:px-8 lg:py-8">
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-[0_22px_50px_-40px_rgba(24,24,27,0.32)]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-700">GeoSphere</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight">Temperatur Österreich</h1>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Suche aktive Messstationen und wähle eine Station für den 24-Stunden-Verlauf.
              </p>
            </div>

            <label htmlFor="station-search" className="mt-6 block text-sm font-medium text-zinc-800">
              Ort oder Stationsname
            </label>
            <div className="relative mt-2">
              <MagnifyingGlass
                size={20}
                weight="bold"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <input
                id="station-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Graz, Wien, Linz"
                className="h-12 w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-10 pr-3 text-sm outline-none transition duration-200 placeholder:text-zinc-400 focus:border-accent-600 focus:bg-white focus:ring-4 focus:ring-accent-100"
              />
            </div>
            <p className="mt-2 text-xs text-zinc-500">Mindestens zwei Zeichen eingeben.</p>

            {searchState === "loading" ? <div className="mt-4"><SearchSkeleton /></div> : null}
            {searchState === "empty" ? (
              <p className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
                Keine aktive GeoSphere-Station für diese Suche gefunden.
              </p>
            ) : null}
            {searchState === "ready" ? (
              <StationList stations={stations} selectedStation={selectedStation} onSelect={handleStationSelect} />
            ) : null}

            <RecentStations
              stations={recentStations}
              selectedStation={selectedStation}
              onSelect={handleStationSelect}
            />
          </div>
        </aside>

        <section className="min-w-0">
          {error ? (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>
          ) : null}

          {showInitial ? (
            <EmptyState
              title="Station auswählen"
              text="Starte mit einem Ortsnamen. Die App nutzt aktive GeoSphere-Stationen und lädt danach die Lufttemperatur der letzten 24 Stunden."
            />
          ) : null}

          {selectedStation && dataState === "loading" && !series ? <DataSkeleton /> : null}
          {selectedStation && dataState === "empty" ? (
            <EmptyState
              title="Keine Messwerte"
              text="GeoSphere hat für diese Station im aktuellen 24-Stunden-Fenster keine Temperaturreihe geliefert."
            />
          ) : null}
          {selectedStation && (dataState === "ready" || dataState === "loading") && series ? (
            <WeatherPanel
              station={selectedStation}
              series={series}
              onRefresh={handleRefresh}
              loading={dataState === "loading"}
            />
          ) : null}
          {selectedStation && dataState === "error" ? (
            <EmptyState
              title="Daten nicht verfügbar"
              text="Bitte wähle eine andere Station oder versuche es später erneut."
            />
          ) : null}
        </section>
      </div>
    </main>
  );
}
