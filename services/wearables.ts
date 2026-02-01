/**
 * Wearable metrics dashboard – fetch and summarize HRV, sleep, steps, stress from wearable_metrics.
 */

import { supabase } from "./supabase";

export type WearableSource =
  | "manual"
  | "bluetooth"
  | "apple_health"
  | "google_fit"
  | "fitbit"
  | "other";

export type MetricType =
  | "heart_rate"
  | "hrv"
  | "sleep_duration"
  | "sleep_quality"
  | "steps"
  | "calories"
  | "stress_score"
  | "readiness_score"
  | "activity_minutes";

export interface DashboardMetric {
  type: MetricType;
  value: number;
  unit: string;
  timestamp: Date;
  source: WearableSource;
}

export interface WeeklyDataPoint {
  date: string;
  value: number;
  source?: WearableSource;
}

export interface MetricSummary {
  latest: DashboardMetric | null;
  weeklyData: WeeklyDataPoint[];
  average: number | null;
  trend: "up" | "down" | "stable" | null;
}

export interface WearablesDashboardData {
  hrv: MetricSummary;
  sleep: MetricSummary;
  steps: MetricSummary;
  stress: MetricSummary;
  lastSyncTime: string | null;
  hasAnyData: boolean;
}

const METRIC_UNITS: Record<MetricType, string> = {
  heart_rate: "bpm",
  hrv: "ms",
  sleep_duration: "hrs",
  sleep_quality: "%",
  steps: "",
  calories: "kcal",
  stress_score: "",
  readiness_score: "",
  activity_minutes: "min",
};

function calculateTrend(data: WeeklyDataPoint[]): "up" | "down" | "stable" | null {
  if (data.length < 2) return null;
  const recent = data.slice(-3).reduce((a, b) => a + b.value, 0) / Math.min(3, data.length);
  const older = data.slice(0, -3).reduce((a, b) => a + b.value, 0) / Math.max(1, data.length - 3);
  const diff = recent - older;
  const threshold = Math.abs(older) * 0.05;
  if (diff > threshold) return "up";
  if (diff < -threshold) return "down";
  return "stable";
}

async function fetchMetricData(
  userId: string,
  metricType: MetricType,
  daysBack = 7
): Promise<MetricSummary> {
  const start = new Date();
  start.setDate(start.getDate() - daysBack);

  const { data, error } = await supabase
    .from("wearable_metrics")
    .select("*")
    .eq("user_id", userId)
    .eq("metric_type", metricType)
    .gte("timestamp", start.toISOString())
    .order("timestamp", { ascending: true });

  if (error || !data?.length) {
    return {
      latest: null,
      weeklyData: [],
      average: null,
      trend: null,
    };
  }

  const byDate: Record<string, (typeof data)[0]> = {};
  for (const row of data) {
    const date = (row.timestamp as string).split("T")[0];
    byDate[date] = row;
  }

  const weeklyData: WeeklyDataPoint[] = Object.entries(byDate).map(([date, row]) => ({
    date,
    value: Number(row.value),
    source: row.source as WearableSource,
  }));

  const latestRow = data[data.length - 1];
  const latest: DashboardMetric = {
    type: metricType,
    value: Number(latestRow.value),
    unit: (latestRow.unit as string) || METRIC_UNITS[metricType],
    timestamp: new Date(latestRow.timestamp as string),
    source: (latestRow.source as WearableSource) ?? "other",
  };

  const values = data.map((d) => Number(d.value));
  const average = values.reduce((a, b) => a + b, 0) / values.length;

  return {
    latest,
    weeklyData,
    average: Math.round(average * 10) / 10,
    trend: calculateTrend(weeklyData),
  };
}

export async function fetchWearablesDashboard(
  userId: string
): Promise<WearablesDashboardData> {
  const [hrv, sleep, steps, stress] = await Promise.all([
    fetchMetricData(userId, "hrv"),
    fetchMetricData(userId, "sleep_duration"),
    fetchMetricData(userId, "steps"),
    fetchMetricData(userId, "stress_score"),
  ]);

  const hasAnyData = [hrv, sleep, steps, stress].some((m) => m.weeklyData.length > 0);

  return {
    hrv,
    sleep,
    steps,
    stress,
    lastSyncTime: null,
    hasAnyData,
  };
}

export function getSourceDisplayName(source: WearableSource): string {
  const names: Record<WearableSource, string> = {
    manual: "Manual",
    bluetooth: "Bluetooth",
    apple_health: "Apple Health",
    google_fit: "Google Fit",
    fitbit: "Fitbit",
    other: "Other",
  };
  return names[source] ?? source;
}
