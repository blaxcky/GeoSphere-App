import { ArrowDownRight, ArrowRight, ArrowUpRight } from "@phosphor-icons/react";
import { formatSignedDelta, numberFormat, timeFormat } from "../../lib/format";
import type { SeriesStats } from "../../lib/series";

function Tile({ label, value, hint, tone = "neutral" }: { label: string; value: string; hint: string; tone?: "neutral" | "warm" | "cold" }) {
  const toneClass = tone === "warm" ? "text-orange-600" : tone === "cold" ? "text-sky-600" : "text-slate-900";
  return (
    <div className="min-w-0 rounded-3xl bg-white px-4 py-4 shadow-soft">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className={`mt-2 truncate font-mono text-xl font-semibold ${toneClass}`}>{value}</p>
      <p className="mt-1 truncate text-[12px] text-slate-500">{hint}</p>
    </div>
  );
}

export function StatsRow({ stats, unit }: { stats: SeriesStats; unit: string }) {
  const { min, max, trend1h } = stats;

  let trendValue = "–";
  let trendHint = "Kein Vergleich";
  let trendIcon = <ArrowRight size={14} weight="bold" aria-hidden="true" />;
  let trendTone: "neutral" | "warm" | "cold" = "neutral";
  if (trend1h !== null) {
    trendValue = `${formatSignedDelta(trend1h)}°`;
    if (trend1h > 0.2) {
      trendHint = "steigt seit 1 h";
      trendIcon = <ArrowUpRight size={14} weight="bold" aria-hidden="true" />;
      trendTone = "warm";
    } else if (trend1h < -0.2) {
      trendHint = "fällt seit 1 h";
      trendIcon = <ArrowDownRight size={14} weight="bold" aria-hidden="true" />;
      trendTone = "cold";
    } else {
      trendHint = "stabil seit 1 h";
    }
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      <Tile
        label="Min 24 h"
        value={min && min.value !== null ? `${numberFormat.format(min.value)}${unit}` : "–"}
        hint={min ? timeFormat.format(new Date(min.timestamp)) : "Keine Daten"}
        tone="cold"
      />
      <Tile
        label="Max 24 h"
        value={max && max.value !== null ? `${numberFormat.format(max.value)}${unit}` : "–"}
        hint={max ? timeFormat.format(new Date(max.timestamp)) : "Keine Daten"}
        tone="warm"
      />
      <div className="min-w-0 rounded-3xl bg-white px-4 py-4 shadow-soft">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Trend</p>
        <p
          className={`mt-2 flex items-center gap-1 truncate font-mono text-xl font-semibold ${
            trendTone === "warm" ? "text-orange-600" : trendTone === "cold" ? "text-sky-600" : "text-slate-900"
          }`}
        >
          {trendIcon}
          {trendValue}
        </p>
        <p className="mt-1 truncate text-[12px] text-slate-500">{trendHint}</p>
      </div>
    </div>
  );
}
