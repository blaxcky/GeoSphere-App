import type { Station, TemperaturePoint, TemperatureSeries } from "../types";

const API_BASE = "https://dataset.api.hub.geosphere.at/v1/station/historical/klima-v2-10min";
const stationCache = new Map<string, Station[]>();
const temperatureCache = new Map<string, TemperatureSeries>();

type RawStation = {
  id?: string | number;
  name?: string;
  state?: string;
  altitude?: number;
  lat?: number;
  lon?: number;
  type?: string;
  is_active?: boolean;
};

type StationSearchResponse = {
  matching_stations?: RawStation[];
};

type TemperatureResponse = {
  timestamps?: string[];
  features?: Array<{
    properties?: {
      parameters?: {
        tl?: {
          unit?: string;
          data?: Array<number | null>;
        };
      };
    };
  }>;
};

const collator = new Intl.Collator("de-AT");

function assertOk(response: Response) {
  if (!response.ok) {
    throw new Error(`GeoSphere API antwortet mit Status ${response.status}.`);
  }
}

function normalizeStation(raw: RawStation): Station | null {
  if (raw.id === undefined || !raw.name) return null;

  return {
    id: String(raw.id),
    name: raw.name,
    state: raw.state ?? "Unbekannt",
    altitude: typeof raw.altitude === "number" ? raw.altitude : null,
    lat: typeof raw.lat === "number" ? raw.lat : null,
    lon: typeof raw.lon === "number" ? raw.lon : null,
    type: raw.type ?? "INDIVIDUAL",
    isActive: raw.is_active ?? true,
  };
}

function sortStations(stations: Station[]) {
  return [...stations].sort((a: Station, b: Station) => {
    if (a.type === "COMBINED" && b.type !== "COMBINED") return -1;
    if (a.type !== "COMBINED" && b.type === "COMBINED") return 1;
    return collator.compare(a.name, b.name);
  });
}

export async function searchStations(query: string, signal?: AbortSignal): Promise<Station[]> {
  const normalized = query.trim().toLowerCase();
  if (normalized.length < 2) return [];

  const cached = stationCache.get(normalized);
  if (cached) return cached;

  const url = new URL(`${API_BASE}/filter`);
  url.searchParams.set("name", query.trim());
  url.searchParams.set("is_active", "true");

  const response = await fetch(url, { signal });
  assertOk(response);

  const payload = (await response.json()) as StationSearchResponse;
  const stations = sortStations(
    (payload.matching_stations ?? [])
      .map(normalizeStation)
      .filter((station): station is Station => station !== null && station.isActive),
  );

  stationCache.set(normalized, stations);
  return stations;
}

function toApiDate(date: Date) {
  return date.toISOString().replace(".000Z", "Z");
}

function formatTimeLabel(timestamp: string) {
  return new Intl.DateTimeFormat("de-AT", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

function latestAvailable(points: TemperaturePoint[]) {
  for (let index = points.length - 1; index >= 0; index -= 1) {
    const point = points[index];
    if (typeof point.value === "number" && Number.isFinite(point.value)) {
      return point;
    }
  }
  return null;
}

export async function getTemperatureSeries(
  stationId: string,
  signal?: AbortSignal,
): Promise<TemperatureSeries> {
  const end = new Date();
  const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
  const cacheKey = `${stationId}:${Math.floor(end.getTime() / (10 * 60 * 1000))}`;
  const cached = temperatureCache.get(cacheKey);
  if (cached) return cached;

  const url = new URL(API_BASE);
  url.searchParams.set("parameters", "tl");
  url.searchParams.set("station_ids", stationId);
  url.searchParams.set("start", toApiDate(start));
  url.searchParams.set("end", toApiDate(end));
  url.searchParams.set("output_format", "geojson");

  const response = await fetch(url, { signal });
  assertOk(response);

  const payload = (await response.json()) as TemperatureResponse;
  const timestamps = payload.timestamps ?? [];
  const parameter = payload.features?.[0]?.properties?.parameters?.tl;
  const values = parameter?.data ?? [];

  const points = timestamps.map<TemperaturePoint>((timestamp, index) => {
    const value = values[index];
    return {
      timestamp,
      timeLabel: formatTimeLabel(timestamp),
      value: typeof value === "number" && Number.isFinite(value) ? value : null,
    };
  });

  const series = {
    points,
    latest: latestAvailable(points),
    unit: parameter?.unit ?? "°C",
  };

  temperatureCache.set(cacheKey, series);
  return series;
}
