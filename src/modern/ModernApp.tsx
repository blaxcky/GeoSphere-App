import { Layout, WarningCircle } from "@phosphor-icons/react";
import { useState } from "react";
import { useWeatherApp } from "../hooks/useWeatherApp";
import type { Station } from "../types";
import { FavoritesScreen } from "./components/FavoritesScreen";
import { SearchScreen } from "./components/SearchScreen";
import { TabBar, type Tab } from "./components/TabBar";
import { WeatherScreen } from "./components/WeatherScreen";

export default function ModernApp({ onSwitchDesign }: { onSwitchDesign: () => void }) {
  const app = useWeatherApp();
  const [tab, setTab] = useState<Tab>("weather");

  function selectAndShow(station: Station) {
    app.selectStation(station);
    setTab("weather");
  }

  return (
    <div className="min-h-[100dvh] bg-surface text-slate-900 md:pl-24">
      <main className="mx-auto w-full max-w-2xl pb-[calc(88px+env(safe-area-inset-bottom,0px))] md:pb-10">
        {app.error ? (
          <div
            role="alert"
            className="mx-4 mt-3 flex items-start gap-2.5 rounded-2xl bg-red-50 px-4 py-3 text-[14px] leading-5 text-red-800"
          >
            <WarningCircle size={20} weight="fill" aria-hidden="true" className="mt-px shrink-0 text-red-500" />
            <span>{app.error}</span>
          </div>
        ) : null}

        {tab === "weather" ? (
          <WeatherScreen
            station={app.selectedStation}
            series={app.series}
            dataState={app.dataState}
            isFavorite={app.selectedStation ? app.favoriteIds.has(app.selectedStation.id) : false}
            favorites={app.favoriteStations}
            recents={app.recentStations}
            onToggleFavorite={app.toggleFavorite}
            onRefresh={app.refresh}
            onSelect={app.selectStation}
            onOpenSearch={() => setTab("search")}
          />
        ) : null}

        {tab === "search" ? (
          <SearchScreen
            query={app.query}
            onQueryChange={app.setQuery}
            stations={app.stations}
            searchState={app.searchState}
            recents={app.recentStations}
            selectedStation={app.selectedStation}
            favoriteIds={app.favoriteIds}
            onSelect={selectAndShow}
            onToggleFavorite={app.toggleFavorite}
          />
        ) : null}

        {tab === "favorites" ? (
          <FavoritesScreen
            favorites={app.favoriteStations}
            selectedStation={app.selectedStation}
            onSelect={selectAndShow}
            onToggleFavorite={app.toggleFavorite}
            onOpenSearch={() => setTab("search")}
          />
        ) : null}

        <footer className="mt-8 flex flex-col items-center gap-2 px-4 text-center text-[12px] text-slate-400">
          <button
            type="button"
            onClick={onSwitchDesign}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-2xl px-4 text-[13px] font-medium text-slate-500 transition duration-150 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 active:scale-[0.97]"
          >
            <Layout size={16} weight="bold" aria-hidden="true" />
            Zum klassischen Design wechseln
          </button>
          <p>Daten: GeoSphere Austria, 10-Minuten-Werte</p>
        </footer>
      </main>

      <TabBar active={tab} onChange={setTab} favoriteCount={app.favoriteStations.length} />
    </div>
  );
}
