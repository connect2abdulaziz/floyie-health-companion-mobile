/**
 * App-wide constants. Use env for secrets (EXPO_PUBLIC_* or EAS secrets).
 * Expo only exposes EXPO_PUBLIC_* to the client; we also support VITE_* as fallback.
 */
export const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";

export const APP_NAME = "Floyie";
