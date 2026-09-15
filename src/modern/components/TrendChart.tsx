import { useMemo, useState } from "react";
import { Area, AreaChart, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { numberFormat, timeFormat } from "../../lib/format";
import type { SeriesStats } from "../../lib/series";
import type { TemperaturePoint } from "../../types";

type ChartState = { activePayload?: Array<{ payload: TemperaturePoint }> };

export function TrendChart({
  points,
  unit,
  stats,
}: {
  points: TemperaturePoint[];
  unit: string;
  stats: SeriesStats;
}) {
  const [hovered, setHovered] = useState<TemperaturePoint | null>(null);
  const shown = hovered ?? [...points].reverse().find((point) => point.value !== null) ?? null;

  const domain = useMemo<[number, number]>(() => {
    const values = points.map((point) => point.value).filter((value): value is number => value !== null);
    if (values.length === 0) return [0, 1];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const pad = Math.max(1, (max - min) * 0.2);
    return [Math.floor(min - pad), Math.ceil(max + pad)];
  }, [points]);

  function handleMove(state: ChartState) {
    const point = state?.activePayload?.[0]?.payload;
    if (point) setHovered(point);
  }

  return (
    <section aria-label="Temperaturverlauf" className="rounded-3xl bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-slate-900">Verlauf 24 h</h2>
          <p className="mt-0.5 text-[13px] text-slate-500">10-Minuten-Messwerte</p>
        </div>
        <div className="text-right font-mono" aria-live="polite">
          <p className="text-lg font-semibold leading-tight text-slate-900">
            {shown && shown.value !== null ? `${numberFormat.format(shown.value)} ${unit}` : "–"}
          </p>
          <p className="text-[12px] text-slate-500">
            {shown ? timeFormat.format(new Date(shown.timestamp)) : ""}
          </p>
        </div>
      </div>
      <div className="mt-3 h-[220px] min-w-0 touch-pan-y md:h-[300px]" onTouchEnd={() => setHovered(null)}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={points}
            margin={{ left: 8, right: 8, top: 24, bottom: 0 }}
            onMouseMove={handleMove}
            onMouseLeave={() => setHovered(null)}
          >
            <defs>
              <linearGradient id="modernTemperatureFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="timeLabel"
              interval="preserveStartEnd"
              minTickGap={60}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              tickMargin={8}
            />
            <YAxis hide domain={domain} />
            <Tooltip content={() => null} cursor={{ stroke: "#2563eb", strokeWidth: 1, strokeDasharray: "4 4" }} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#2563eb"
              strokeWidth={2.5}
              fill="url(#modernTemperatureFill)"
              connectNulls={false}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: "#ffffff", fill: "#2563eb" }}
              isAnimationActive={false}
            />
            {stats.max && stats.max.value !== null ? (
              <ReferenceDot
                x={stats.max.timeLabel}
                y={stats.max.value}
                r={4}
                fill="#ea580c"
                stroke="#ffffff"
                strokeWidth={2}
                label={{ value: numberFormat.format(stats.max.value), position: "top", fill: "#ea580c", fontSize: 11, fontWeight: 600 }}
              />
            ) : null}
            {stats.min && stats.min.value !== null ? (
              <ReferenceDot
                x={stats.min.timeLabel}
                y={stats.min.value}
                r={4}
                fill="#0284c7"
                stroke="#ffffff"
                strokeWidth={2}
                label={{ value: numberFormat.format(stats.min.value), position: "bottom", fill: "#0284c7", fontSize: 11, fontWeight: 600 }}
              />
            ) : null}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
