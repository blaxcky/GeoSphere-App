import { ThermometerSimple } from "@phosphor-icons/react";
import { dateTimeFormat, formatRelativeTime, numberFormat } from "../../lib/format";
import type { TemperatureSeries } from "../../types";

export function HeroCard({ series }: { series: TemperatureSeries }) {
  const latest = series.latest;

  return (
    <section
      aria-label="Aktuelle Temperatur"
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-50 via-white to-surface-tint p-6 shadow-soft"
    >
      <ThermometerSimple
        size={160}
        weight="duotone"
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 -top-6 text-brand-100/70"
      />
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Aktuell</p>
      {latest ? (
        <>
          <div className="mt-3 flex items-start font-mono tracking-tight text-slate-900">
            <span className="text-[76px] font-semibold leading-none">{numberFormat.format(latest.value ?? 0)}</span>
            <span className="mt-2 text-2xl font-medium text-slate-500">{series.unit}</span>
          </div>
          <p className="mt-4 text-[15px] text-slate-500" title={dateTimeFormat.format(new Date(latest.timestamp))}>
            Gemessen {formatRelativeTime(latest.timestamp)}
          </p>
        </>
      ) : (
        <>
          <div className="mt-3 text-3xl font-semibold text-slate-400">Keine Daten</div>
          <p className="mt-4 text-[15px] text-slate-500">
            Im 24-Stunden-Fenster wurde kein gültiger Temperaturwert gefunden.
          </p>
        </>
      )}
    </section>
  );
}
