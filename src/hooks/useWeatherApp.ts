import { useEffect, useMemo, useState } from "react";
import { getTemperatureSeries, searchStations } from "../api/geosphere";
import {
  addRecentStation,
  readFavoriteStations,
  readRecentStations,
  writeFavoriteStations,
  writeRecentStations,
} from "../lib/storage";
import type { Station, TemperatureSeries } from "../types";

export type LoadState = "idle" | "loading" | "ready" | "empty" | "error";

export function useWeatherApp() {
  const [query, setQuery] = useState("");
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [recentStations, setRecentStations] = useState<Station[]>([]);
  const [favoriteStations, setFavoriteStations] = useState<Station[]>([]);
  const [series, setSeries] = useState<TemperatureSeries | null>(null);
  const [searchState, setSearchState] = useState<LoadState>("idle");
  const [dataState, setDataState] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedStations = readRecentStations();
    setFavoriteStations(readFavoriteStations());
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

  function selectStation(station: Station) {
    setSelectedStation(station);
    setQuery(station.name);
  }

  function toggleFavorite(station: Station) {
    setFavoriteStations((current) => {
      const isFavorite = current.some((item) => item.id === station.id);
      const updated = isFavorite
        ? current.filter((item) => item.id !== station.id)
        : [station, ...current.filter((item) => item.id !== station.id)];
      writeFavoriteStations(updated);
      return updated;
    });
  }

  function refresh() {
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

  const favoriteIds = useMemo(
    () => new Set(favoriteStations.map((station) => station.id)),
    [favoriteStations],
  );

  return {
    query,
    setQuery,
    stations,
    searchState,
    selectedStation,
    recentStations,
    favoriteStations,
    favoriteIds,
    series,
    dataState,
    error,
    selectStation,
    toggleFavorite,
    refresh,
  };
}
