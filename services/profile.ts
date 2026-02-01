/**
 * Profile service – fetch and update user profile (profiles table).
 */

import { supabase } from "./supabase";

export interface Profile {
  id: string;
  name: string;
  age: number | null;
  gender: string | null;
  updated_at: string;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, age, gender, updated_at")
    .eq("id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    console.error("[profile] getProfile error:", error);
    return null;
  }

  return data as Profile;
}

export async function updateProfile(
  userId: string,
  updates: { name?: string; age?: number | null; gender?: string | null }
): Promise<{ success: boolean; error?: string }> {
  const existing = await getProfile(userId);
  const updatedAt = new Date().toISOString();
  const payload: Record<string, unknown> = {
    ...updates,
    updated_at: updatedAt,
  };
  if (updates.name === undefined) delete payload.name;
  if (updates.age === undefined) delete payload.age;
  if (updates.gender === undefined) delete payload.gender;

  if (existing) {
    const { error } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", userId);
    if (error) {
      console.error("[profile] updateProfile error:", error);
      return { success: false, error: error.message };
    }
    return { success: true };
  }

  const { error } = await supabase.from("profiles").insert({
    id: userId,
    name: (updates.name as string) ?? "",
    age: updates.age ?? null,
    gender: updates.gender ?? null,
    updated_at: updatedAt,
  });
  if (error) {
    console.error("[profile] updateProfile insert error:", error);
    return { success: false, error: error.message };
  }
  return { success: true };
}
