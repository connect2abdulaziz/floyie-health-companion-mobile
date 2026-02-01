import { supabase } from "@/services/supabase";

interface ScoreComponents {
  bpScore: number;
  bpVariabilityScore: number;
  hrScore: number;
  activityScore: number;
  sleepScore: number;
  medicationAdherence: number;
}

export interface FloScoreResult {
  score: number;
  trend: "up" | "stable" | "down";
  components: ScoreComponents;
  explanation: string;
  score_date?: string;
}

function calculateBPScore(avgSystolic: number, avgDiastolic: number): number {
  if (avgSystolic >= 180 || avgDiastolic >= 120) return 0;
  if (avgSystolic >= 140 || avgDiastolic >= 90) return 5;
  if (avgSystolic >= 130 || avgDiastolic >= 80) return 12;
  if (avgSystolic >= 120 && avgDiastolic < 80) return 20;
  return 25;
}

function calculateVariabilityScore(readings: { systolic: number }[]): number {
  if (readings.length < 3) return 15;
  const values = readings.map((r) => r.systolic);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  if (stdDev <= 5) return 15;
  if (stdDev <= 10) return 12;
  if (stdDev <= 15) return 8;
  if (stdDev <= 20) return 4;
  return 0;
}

function calculateHRScore(avgHR: number): number {
  if (avgHR >= 50 && avgHR <= 85) return 15;
  if (avgHR >= 45 && avgHR <= 90) return 12;
  if (avgHR >= 40 && avgHR <= 100) return 8;
  return 4;
}

function calculateActivityScore(avgDailySteps: number): number {
  if (avgDailySteps >= 10000) return 20;
  if (avgDailySteps >= 7500) return 16;
  if (avgDailySteps >= 5000) return 12;
  if (avgDailySteps >= 2500) return 8;
  return 4;
}

function calculateSleepScore(avgSleepHours: number): number {
  if (avgSleepHours >= 7 && avgSleepHours <= 9) return 15;
  if (avgSleepHours >= 6 && avgSleepHours <= 10) return 12;
  if (avgSleepHours >= 5 && avgSleepHours <= 11) return 8;
  return 4;
}

function calculateMedicationAdherenceScore(adherenceRate: number): number {
  if (adherenceRate >= 0.95) return 10;
  if (adherenceRate >= 0.85) return 8;
  if (adherenceRate >= 0.7) return 6;
  if (adherenceRate >= 0.5) return 3;
  return 0;
}

function generateExplanation(_components: ScoreComponents, _score: number): string {
  return "Based on your last 7 days of readings, activity, and habits.";
}

export async function calculateFloScore(userId: string): Promise<FloScoreResult> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: readings } = await supabase
    .from("readings")
    .select("systolic, diastolic, heart_rate")
    .eq("user_id", userId)
    .gte("timestamp", sevenDaysAgo.toISOString());

  const { data: wearableMetrics } = await supabase
    .from("wearable_metrics")
    .select("metric_type, value")
    .eq("user_id", userId)
    .gte("timestamp", sevenDaysAgo.toISOString());

  const { data: medicationLogs } = await supabase
    .from("medication_logs")
    .select("status")
    .eq("user_id", userId)
    .gte("scheduled_time", sevenDaysAgo.toISOString());

  const readingsList = readings || [];
  const avgSystolic =
    readingsList.length > 0
      ? readingsList.reduce((s, r) => s + r.systolic, 0) / readingsList.length
      : 120;
  const avgDiastolic =
    readingsList.length > 0
      ? readingsList.reduce((s, r) => s + r.diastolic, 0) / readingsList.length
      : 80;
  const avgHR =
    readingsList.length > 0
      ? readingsList.reduce((s, r) => s + r.heart_rate, 0) / readingsList.length
      : 70;

  const metrics = wearableMetrics || [];
  const stepsData = metrics.filter((m) => m.metric_type === "steps");
  const sleepData = metrics.filter((m) => m.metric_type === "sleep_duration");
  const avgDailySteps =
    stepsData.length > 0
      ? stepsData.reduce((s, m) => s + Number(m.value), 0) / stepsData.length
      : 5000;
  const avgSleepHours =
    sleepData.length > 0
      ? sleepData.reduce((s, m) => s + Number(m.value), 0) / sleepData.length
      : 7;

  const logs = medicationLogs || [];
  const takenLogs = logs.filter((l) => l.status === "taken");
  const adherenceRate = logs.length > 0 ? takenLogs.length / logs.length : 1;

  const components: ScoreComponents = {
    bpScore: calculateBPScore(avgSystolic, avgDiastolic),
    bpVariabilityScore: calculateVariabilityScore(readingsList),
    hrScore: calculateHRScore(avgHR),
    activityScore: calculateActivityScore(avgDailySteps),
    sleepScore: calculateSleepScore(avgSleepHours),
    medicationAdherence: calculateMedicationAdherenceScore(adherenceRate),
  };

  const score = Math.round(
    Object.values(components).reduce((a, b) => a + b, 0)
  );

  const { data: previousScore } = await supabase
    .from("flo_scores")
    .select("score")
    .eq("user_id", userId)
    .lt("score_date", new Date().toISOString().split("T")[0])
    .order("score_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  let trend: "up" | "stable" | "down" = "stable";
  if (previousScore) {
    const diff = score - previousScore.score;
    if (diff > 5) trend = "up";
    else if (diff < -5) trend = "down";
  }

  const explanation = generateExplanation(components, score);
  return { score, trend, components, explanation };
}

export async function saveFloScore(
  userId: string,
  result: FloScoreResult
): Promise<void> {
  const today = new Date().toISOString().split("T")[0];
  await supabase.from("flo_scores").upsert(
    {
      user_id: userId,
      score: result.score,
      trend: result.trend,
      components: result.components as unknown as Record<string, unknown>,
      explanation: result.explanation,
      score_date: today,
      calculated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,score_date" }
  );
}

export async function getLatestFloScore(
  userId: string
): Promise<FloScoreResult | null> {
  const { data, error } = await supabase
    .from("flo_scores")
    .select("*")
    .eq("user_id", userId)
    .order("score_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  const components = (data.components || {}) as ScoreComponents;
  return {
    score: data.score,
    trend: (data.trend as "up" | "stable" | "down") || "stable",
    components,
    explanation: data.explanation || "",
    score_date: data.score_date,
  };
}
