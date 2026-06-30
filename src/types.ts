export type StationKind = "INDIVIDUAL" | "COMBINED" | "SUB_STATION" | string;

export type Station = {
  id: string;
  name: string;
  state: string;
  altitude: number | null;
  lat: number | null;
  lon: number | null;
  type: StationKind;
  isActive: boolean;
};

export type TemperaturePoint = {
  timestamp: string;
  timeLabel: string;
  value: number | null;
};

export type TemperatureSeries = {
  points: TemperaturePoint[];
  latest: TemperaturePoint | null;
  unit: string;
};
