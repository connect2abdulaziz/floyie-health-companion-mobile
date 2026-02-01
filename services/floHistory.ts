/**
 * Flo AI suggestion history – fetch and display past Flo insights from ai_suggestions.
 */

import { supabase } from "./supabase";

export type SuggestionType =
  | "bp_pattern"
  | "missed_logs"
  | "sleep_pattern"
  | "activity_pattern"
  | "hrv_pattern"
  | "stress_pattern"
  | "celebration"
  | "general_wellness";

export interface AISuggestion {
  id: string;
  user_id: string;
  role: string;
  suggestion_text: string;
  suggestion_type: string | null;
  context: Record<string, unknown> | null;
  created_at: string;
}

export async function fetchAISuggestions(
  userId: string,
  limit = 50,
  offset = 0,
  filterType?: SuggestionType
): Promise<AISuggestion[]> {
  let query = supabase
    .from("ai_suggestions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (filterType) {
    query = query.eq("suggestion_type", filterType);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[floHistory] fetchAISuggestions error:", error);
    return [];
  }

  return (data as AISuggestion[]) ?? [];
}

export function getSuggestionTypeLabel(type: string | null): string {
  if (!type) return "Insight";
  const labels: Record<string, string> = {
    bp_pattern: "BP Trend",
    missed_logs: "Logging Reminder",
    sleep_pattern: "Sleep Pattern",
    activity_pattern: "Activity Pattern",
    hrv_pattern: "HRV Pattern",
    stress_pattern: "Stress Pattern",
    celebration: "Achievement",
    general_wellness: "Wellness Tip",
  };
  return labels[type] ?? "Insight";
}

/** Tailwind-style class names for suggestion type badges (use with className). */
export function getSuggestionTypeClassName(type: string | null): string {
  if (!type) return "bg-gray-100";
  const classes: Record<string, string> = {
    bp_pattern: "bg-red-100",
    missed_logs: "bg-amber-100",
    sleep_pattern: "bg-indigo-100",
    activity_pattern: "bg-green-100",
    hrv_pattern: "bg-purple-100",
    stress_pattern: "bg-orange-100",
    celebration: "bg-emerald-100",
    general_wellness: "bg-blue-100",
  };
  return classes[type] ?? "bg-gray-100";
}

export const SUGGESTION_TYPE_OPTIONS: { value: SuggestionType | "all"; label: string }[] = [
  { value: "all", label: "All Insights" },
  { value: "bp_pattern", label: "BP Trends" },
  { value: "missed_logs", label: "Logging Reminders" },
  { value: "sleep_pattern", label: "Sleep Patterns" },
  { value: "activity_pattern", label: "Activity Patterns" },
  { value: "hrv_pattern", label: "HRV Patterns" },
  { value: "stress_pattern", label: "Stress Patterns" },
  { value: "celebration", label: "Achievements" },
  { value: "general_wellness", label: "Wellness Tips" },
];
