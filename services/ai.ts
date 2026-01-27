/**
 * Placeholder for AI/wellness insights. Backend URL via env.
 */
const AI_API_URL = process.env.EXPO_PUBLIC_AI_API_URL ?? "";

export async function getWellnessInsight(prompt: string): Promise<string> {
  if (!AI_API_URL) return "";
  // TODO: call your AI backend
  return "";
}
