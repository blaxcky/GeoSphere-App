# GeoSphere Temperatur

Kleine React-Web-App für aktive GeoSphere-Stationen in Österreich. Nach der Stationsauswahl zeigt sie den letzten gültigen Lufttemperaturwert und den 24-Stunden-Verlauf der 10-Minuten-Daten.

## Designs

Die App hat zwei Oberflächen: das mobile-orientierte Standarddesign (Bottom-Tab-Bar, `src/modern/`) und das klassische Zweispalten-Layout (`src/classic/`). Über den Button „Zum klassischen Design wechseln“ bzw. „Neues Design“ lässt sich umschalten; die Wahl wird im localStorage unter `geosphere-design` gespeichert. Beide Designs teilen sich die Logik in `src/hooks/useWeatherApp.ts`.

## Entwicklung

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Deployment läuft über GitHub Actions zu GitHub Pages.
