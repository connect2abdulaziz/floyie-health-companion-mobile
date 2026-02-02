import { supabase } from "./supabase";

export interface Reading {
  id: string;
  user_id: string;
  systolic: number;
  diastolic: number;
  heart_rate: number;
  timestamp: string;
  notes: string | null;
  source?: string;
}

export type NewReading = Omit<Reading, "id">;

/**
 * Fetch readings for a user within a date range.
 */
export async function getReadings(
  userId: string,
  options?: { days?: number; limit?: number }
): Promise<{ data: Reading[] | null; error: Error | null }> {
  const { days = 7, limit = 50 } = options ?? {};

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from("readings")
    .select("*")
    .eq("user_id", userId)
    .gte("timestamp", startDate.toISOString())
    .order("timestamp", { ascending: false })
    .limit(limit);

  return { data, error: error as Error | null };
}

/**
 * Fetch the latest reading for a user.
 */
export async function getLatestReading(
  userId: string
): Promise<{ data: Reading | null; error: Error | null }> {
  const { data, error } = await supabase
    .from("readings")
    .select("*")
    .eq("user_id", userId)
    .order("timestamp", { ascending: false })
    .limit(1)
    .maybeSingle();

  return { data, error: error as Error | null };
}

/**
 * Insert a new reading.
 */
export async function addReading(
  reading: NewReading
): Promise<{ data: Reading | null; error: Error | null }> {
  const { data, error } = await supabase
    .from("readings")
    .insert(reading)
    .select()
    .single();

  return { data, error: error as Error | null };
}

/**
 * Delete a reading by ID.
 */
export async function deleteReading(
  readingId: string
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from("readings")
    .delete()
    .eq("id", readingId);

  return { error: error as Error | null };
}
