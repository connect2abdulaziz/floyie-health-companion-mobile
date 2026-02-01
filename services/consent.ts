/**
 * Consent service – user consent and preferences (user_consent table).
 * Matches web: ai_insights, wearable_sync in metadata.
 */

import { supabase } from "./supabase";

export interface UserConsent {
  id: string;
  user_id: string;
  agreed: boolean;
  agreed_at: string | null;
  version: string;
  metadata: {
    apple_health?: boolean;
    google_fit?: boolean;
    fitbit?: boolean;
    bluetooth?: boolean;
    ai_insights?: boolean;
    wearable_sync?: boolean;
  };
  created_at: string;
  updated_at: string;
}

export async function getUserConsent(userId: string): Promise<UserConsent | null> {
  const { data, error } = await supabase
    .from("user_consent")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("[consent] getUserConsent error:", error);
    return null;
  }

  return data as UserConsent | null;
}

export async function updatePreference(
  userId: string,
  preference: "ai_insights" | "wearable_sync",
  enabled: boolean
): Promise<{ success: boolean; error?: string }> {
  const existing = await getUserConsent(userId);
  if (!existing) {
    return { success: false, error: "No consent record found" };
  }

  const metadata = {
    ...(existing.metadata ?? {}),
    [preference]: enabled,
  };

  const { error } = await supabase
    .from("user_consent")
    .update({ metadata, updated_at: new Date().toISOString() })
    .eq("user_id", userId);

  if (error) {
    console.error("[consent] updatePreference error:", error);
    return { success: false, error: error.message };
  }
  return { success: true };
}
