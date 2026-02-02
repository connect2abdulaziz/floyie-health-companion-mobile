import { supabase } from "../supabase";
import { classifyBP } from "@/lib/bpZones";

export type RiskLevel = "low" | "moderate" | "high";
export type TrendDirection = "improving" | "stable" | "worsening";
export type Variability = "low" | "moderate" | "high";

export interface PatientMetrics {
  avgSystolic: number;
  avgDiastolic: number;
  avgHeartRate: number;
  riskLevel: RiskLevel;
  trend: TrendDirection;
  variability: Variability;
  readingsCount: number;
  floScore: number | null;
  lastReadingAge: string;
  compliance: number;
}

export interface PatientProfile {
  id: string;
  name: string;
  age?: number;
  gender?: string;
}

/**
 * Get patient profile
 */
export async function getPatientProfile(
  patientId: string
): Promise<{ data: PatientProfile | null; error: Error | null }> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, age, gender")
    .eq("id", patientId)
    .maybeSingle();

  if (error) {
    return { data: null, error: error as Error };
  }

  return { data: data as PatientProfile | null, error: null };
}

/**
 * Calculate patient metrics for the doctor dashboard
 */
export async function calculatePatientMetrics(
  patientId: string
): Promise<PatientMetrics | null> {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  // Get current week readings
  const { data: currentReadings } = await supabase
    .from("readings")
    .select("systolic, diastolic, heart_rate, timestamp")
    .eq("user_id", patientId)
    .gte("timestamp", sevenDaysAgo.toISOString())
    .order("timestamp", { ascending: false });

  // Get previous week readings for trend
  const { data: previousReadings } = await supabase
    .from("readings")
    .select("systolic, diastolic")
    .eq("user_id", patientId)
    .gte("timestamp", fourteenDaysAgo.toISOString())
    .lt("timestamp", sevenDaysAgo.toISOString());

  // Get latest Flo Score
  const { data: floScoreData } = await supabase
    .from("flo_scores")
    .select("score")
    .eq("user_id", patientId)
    .order("calculated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const current = currentReadings || [];
  const previous = previousReadings || [];

  if (current.length === 0) {
    return null;
  }

  // Calculate averages
  const avgSystolic = Math.round(
    current.reduce((s, r) => s + r.systolic, 0) / current.length
  );
  const avgDiastolic = Math.round(
    current.reduce((s, r) => s + r.diastolic, 0) / current.length
  );
  const avgHeartRate = Math.round(
    current.reduce((s, r) => s + r.heart_rate, 0) / current.length
  );

  // Calculate risk level based on average BP
  const bpClass = classifyBP(avgSystolic, avgDiastolic);
  let riskLevel: RiskLevel = "low";
  if (bpClass.category === "crisis" || bpClass.category === "stage2") {
    riskLevel = "high";
  } else if (bpClass.category === "stage1" || bpClass.category === "elevated") {
    riskLevel = "moderate";
  }

  // Calculate trend
  let trend: TrendDirection = "stable";
  if (previous.length > 0) {
    const prevAvgSystolic =
      previous.reduce((s, r) => s + r.systolic, 0) / previous.length;
    const diff = avgSystolic - prevAvgSystolic;

    // For BP, lower is better (going down = improving)
    if (diff <= -5) trend = "improving";
    else if (diff >= 5) trend = "worsening";
    else trend = "stable";
  }

  // Calculate variability (standard deviation)
  const systolicValues = current.map((r) => r.systolic);
  const mean = systolicValues.reduce((a, b) => a + b, 0) / systolicValues.length;
  const variance =
    systolicValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    systolicValues.length;
  const stdDev = Math.sqrt(variance);

  let variability: Variability = "low";
  if (stdDev > 15) variability = "high";
  else if (stdDev > 8) variability = "moderate";

  // Calculate last reading age
  const lastReading = current[0];
  const lastReadingTime = new Date(lastReading.timestamp);
  const hoursAgo = Math.floor(
    (now.getTime() - lastReadingTime.getTime()) / (1000 * 60 * 60)
  );
  let lastReadingAge: string;
  if (hoursAgo < 1) lastReadingAge = "Just now";
  else if (hoursAgo < 24) lastReadingAge = `${hoursAgo}h ago`;
  else lastReadingAge = `${Math.floor(hoursAgo / 24)}d ago`;

  // Calculate compliance (expected 2 readings per day)
  const expectedReadings = 14; // 7 days * 2
  const compliance = Math.min(
    100,
    Math.round((current.length / expectedReadings) * 100)
  );

  return {
    avgSystolic,
    avgDiastolic,
    avgHeartRate,
    riskLevel,
    trend,
    variability,
    readingsCount: current.length,
    floScore: floScoreData?.score ?? null,
    lastReadingAge,
    compliance,
  };
}

/**
 * Generate a clinical summary for the patient
 */
export async function generateClinicalSummary(
  patientId: string
): Promise<string> {
  const metrics = await calculatePatientMetrics(patientId);

  if (!metrics) {
    return "Insufficient data to generate a summary. Encourage the patient to log more readings.";
  }

  const parts: string[] = [];

  // BP summary
  const bpStatus =
    metrics.riskLevel === "low"
      ? "within healthy range"
      : metrics.riskLevel === "moderate"
        ? "slightly elevated"
        : "elevated and requires attention";
  parts.push(
    `Over the last 7 days, average BP is ${metrics.avgSystolic}/${metrics.avgDiastolic}, ${bpStatus}.`
  );

  // Trend
  if (metrics.trend === "improving") {
    parts.push("BP readings show an improving trend compared to the previous week.");
  } else if (metrics.trend === "worsening") {
    parts.push("BP readings are trending upward compared to the previous week.");
  } else {
    parts.push("BP readings remain stable.");
  }

  // Variability
  if (metrics.variability === "high") {
    parts.push(
      "High day-to-day variability detected; consider reviewing measurement timing and technique."
    );
  } else if (metrics.variability === "moderate") {
    parts.push("Moderate variability in readings.");
  }

  // Flo Score
  if (metrics.floScore !== null) {
    if (metrics.floScore >= 80) {
      parts.push(`Flo Score: ${metrics.floScore} (excellent).`);
    } else if (metrics.floScore >= 60) {
      parts.push(`Flo Score: ${metrics.floScore} (good).`);
    } else {
      parts.push(`Flo Score: ${metrics.floScore} (needs improvement).`);
    }
  }

  // Compliance
  if (metrics.compliance < 50) {
    parts.push("Low compliance with recommended measurement frequency.");
  }

  return parts.join(" ");
}

/**
 * Get patient readings for a specific time period
 */
export async function getPatientReadings(
  patientId: string,
  days: number = 7
): Promise<{
  data: Array<{
    id: string;
    systolic: number;
    diastolic: number;
    heart_rate: number;
    timestamp: string;
    notes: string | null;
  }> | null;
  error: Error | null;
}> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from("readings")
    .select("id, systolic, diastolic, heart_rate, timestamp, notes")
    .eq("user_id", patientId)
    .gte("timestamp", startDate.toISOString())
    .order("timestamp", { ascending: false });

  if (error) {
    return { data: null, error: error as Error };
  }

  return { data, error: null };
}
