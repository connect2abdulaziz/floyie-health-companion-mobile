import { useEffect, useRef } from "react";
import { useRouter } from "expo-router";

/**
 * Catch-all for unmatched routes (e.g. /--/ from dev client).
 * Redirect to auth welcome so the app never shows "Unmatched Route".
 */
export default function NotFound() {
  const router = useRouter();
  const didRedirect = useRef(false);

  useEffect(() => {
    if (didRedirect.current) return;
    didRedirect.current = true;
    router.replace("/(auth)/welcome");
  }, [router]);

  return null;
}
