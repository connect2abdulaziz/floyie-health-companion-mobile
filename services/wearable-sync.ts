/**
 * Placeholder for wearable/sync service. Backend URL can be configured via env.
 * No native Bluetooth in this app; sync would be API-based.
 */
const SYNC_API_URL = process.env.EXPO_PUBLIC_SYNC_API_URL ?? "";

export async function syncFromBackend(): Promise<void> {
  if (!SYNC_API_URL) return;
  // TODO: call your backend sync endpoint
}
