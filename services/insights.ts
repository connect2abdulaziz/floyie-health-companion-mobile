import { supabase } from "@/services/supabase";
import { SUPABASE_URL } from "@/lib/constants";

export interface ReadingRef {
  id: string;
  systolic: number;
  diastolic: number;
  heart_rate: number;
  timestamp: string;
}

export interface Insight {
  id: string;
  generated_text: string;
  created_at: string;
  reading_id: string | null;
  reading?: ReadingRef;
}

const INSIGHTS_LIMIT = 20;
const READINGS_LIMIT = 20;

/**
 * Fetches ai_insights for the user, ordered by created_at desc.
 */
export async function fetchInsights(userId: string): Promise<Insight[]> {
  const { data, error } = await supabase
    .from("ai_insights")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(INSIGHTS_LIMIT);

  if (error) throw error;
  return (data ?? []) as Insight[];
}

/**
 * Fetches recent readings for the user (to enrich insights and check for missing).
 */
export async function fetchReadingsForInsights(userId: string): Promise<ReadingRef[]> {
  const { data, error } = await supabase
    .from("readings")
    .select("id, systolic, diastolic, heart_rate, timestamp")
    .eq("user_id", userId)
    .order("timestamp", { ascending: false })
    .limit(READINGS_LIMIT);

  if (error) throw error;
  return (data ?? []) as ReadingRef[];
}

/**
 * Loads insights and readings, then enriches each insight with its linked reading.
 */
export async function loadInsightsWithReadings(userId: string): Promise<{
  insights: Insight[];
  readings: ReadingRef[];
}> {
  const [insights, readings] = await Promise.all([
    fetchInsights(userId),
    fetchReadingsForInsights(userId),
  ]);

  const enriched: Insight[] = insights.map((insight) => ({
    ...insight,
    reading: insight.reading_id
      ? readings.find((r) => r.id === insight.reading_id)
      : undefined,
  }));

  return { insights: enriched, readings };
}

/**
 * Calls the Supabase Edge Function to generate an insight for one reading.
 * Returns true if the request succeeded (2xx), false otherwise.
 */
export async function generateInsightForReading(
  accessToken: string,
  reading: ReadingRef,
  recentReadings: ReadingRef[]
): Promise<boolean> {
  if (!SUPABASE_URL) return false;

  const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-insight`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      reading_id: reading.id,
      systolic: reading.systolic,
      diastolic: reading.diastolic,
      heart_rate: reading.heart_rate,
      recent_readings: recentReadings.slice(0, 7),
    }),
  });

  return response.ok;
}
