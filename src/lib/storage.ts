import type { Station } from "../types";

export const RECENT_STATIONS_KEY = "geosphere-recent-stations";
export const FAVORITE_STATIONS_KEY = "geosphere-favorite-stations";
export const MAX_RECENT_STATIONS = 3;

export function readRecentStations(): Station[] {
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

export function writeRecentStations(stations: Station[]) {
  try {
    window.localStorage.setItem(RECENT_STATIONS_KEY, JSON.stringify(stations.slice(0, MAX_RECENT_STATIONS)));
  } catch {
    // The app remains usable when browser storage is unavailable or full.
  }
}

export function addRecentStation(stations: Station[], station: Station) {
  return [station, ...stations.filter((item) => item.id !== station.id)].slice(0, MAX_RECENT_STATIONS);
}

function isNullableFiniteNumber(value: unknown): value is number | null {
  return value === null || (typeof value === "number" && Number.isFinite(value));
}

export function isStation(value: unknown): value is Station {
  if (!value || typeof value !== "object") return false;

  const station = value as Record<string, unknown>;
  return (
    typeof station.id === "string" &&
    station.id.trim().length > 0 &&
    typeof station.name === "string" &&
    station.name.trim().length > 0 &&
    typeof station.state === "string" &&
    isNullableFiniteNumber(station.altitude) &&
    isNullableFiniteNumber(station.lat) &&
    isNullableFiniteNumber(station.lon) &&
    typeof station.type === "string" &&
    station.type.trim().length > 0 &&
    typeof station.isActive === "boolean"
  );
}

export function readFavoriteStations(): Station[] {
  try {
    const raw = window.localStorage.getItem(FAVORITE_STATIONS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const seen = new Set<string>();
    return parsed.filter((station): station is Station => {
      if (!isStation(station) || seen.has(station.id)) return false;
      seen.add(station.id);
      return true;
    });
  } catch {
    return [];
  }
}

export function writeFavoriteStations(stations: Station[]) {
  try {
    window.localStorage.setItem(FAVORITE_STATIONS_KEY, JSON.stringify(stations));
  } catch {
    // The in-memory favorite state still works when storage is unavailable or full.
  }
}
