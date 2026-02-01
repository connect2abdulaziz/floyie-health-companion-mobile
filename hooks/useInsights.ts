import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  loadInsightsWithReadings,
  generateInsightForReading,
  type Insight,
  type ReadingRef,
} from "@/services/insights";

export interface UseInsightsResult {
  insights: Insight[];
  readings: ReadingRef[];
  loading: boolean;
  error: string | null;
  generating: boolean;
  refetch: () => Promise<void>;
  generateMissing: () => Promise<void>;
  hasReadingsWithoutInsights: boolean;
}

export function useInsights(): UseInsightsResult {
  const { user, session } = useAuth();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [readings, setReadings] = useState<ReadingRef[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const refetch = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const result = await loadInsightsWithReadings(user.id);
      setInsights(result.insights);
      setReadings(result.readings);
    } catch (err) {
      console.error("useInsights refetch:", err);
      setError(
        "We couldn't load your insights. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refetch();
    } else {
      setLoading(false);
      setInsights([]);
      setReadings([]);
    }
  }, [user, refetch]);

  const readingIdsWithInsights = new Set(insights.map((i) => i.reading_id));
  const hasReadingsWithoutInsights = readings.some(
    (r) => !readingIdsWithInsights.has(r.id)
  );

  const generateMissing = useCallback(async () => {
    if (!user || readings.length === 0) return;

    const readingsWithoutInsights = readings
      .filter((r) => !readingIdsWithInsights.has(r.id))
      .slice(0, 5);

    if (readingsWithoutInsights.length === 0) return;

    const token = session?.access_token;
    if (!token) return;

    setGenerating(true);
    try {
      for (const reading of readingsWithoutInsights) {
        await generateInsightForReading(token, reading, readings);
      }
      await refetch();
    } catch (err) {
      console.error("useInsights generateMissing:", err);
    } finally {
      setGenerating(false);
    }
  }, [user, session?.access_token, readings, insights, refetch]);

  return {
    insights,
    readings,
    loading,
    error,
    generating,
    refetch,
    generateMissing,
    hasReadingsWithoutInsights,
  };
}
