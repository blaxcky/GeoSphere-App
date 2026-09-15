import type { TemperaturePoint, TemperatureSeries } from "../types";

export type SeriesStats = {
  min: TemperaturePoint | null;
  max: TemperaturePoint | null;
  /** Difference between the latest value and the value roughly one hour earlier. */
  trend1h: number | null;
};

const ONE_HOUR = 60 * 60 * 1000;

export function getSeriesStats(series: TemperatureSeries | null): SeriesStats {
  if (!series) return { min: null, max: null, trend1h: null };

  let min: TemperaturePoint | null = null;
  let max: TemperaturePoint | null = null;

  for (const point of series.points) {
    if (point.value === null) continue;
    if (!min || point.value < min.value!) min = point;
    if (!max || point.value > max.value!) max = point;
  }

  let trend1h: number | null = null;
  const latest = series.latest;
  if (latest && latest.value !== null) {
    const target = new Date(latest.timestamp).getTime() - ONE_HOUR;
    let closest: TemperaturePoint | null = null;
    let closestDistance = Number.POSITIVE_INFINITY;
    for (const point of series.points) {
      if (point.value === null) continue;
      const distance = Math.abs(new Date(point.timestamp).getTime() - target);
      if (distance < closestDistance) {
        closest = point;
        closestDistance = distance;
      }
    }
    // Only report a trend when a value exists within 20 minutes of "one hour ago".
    if (closest && closestDistance <= 20 * 60 * 1000 && closest !== latest) {
      trend1h = latest.value - closest.value!;
    }
  }

  return { min, max, trend1h };
}
