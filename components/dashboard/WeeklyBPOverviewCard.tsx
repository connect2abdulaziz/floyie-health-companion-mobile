import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/services/supabase";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card";

interface WeeklyStats {
  avgSystolic: number;
  avgDiastolic: number;
  trend: "improving" | "stable" | "rising";
  trendValue: number;
  readingsCount: number;
}

export function WeeklyBPOverviewCard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    Promise.all([
      supabase
        .from("readings")
        .select("systolic, diastolic, timestamp")
        .eq("user_id", user.id)
        .gte("timestamp", sevenDaysAgo.toISOString())
        .order("timestamp", { ascending: true }),
      supabase
        .from("readings")
        .select("systolic, diastolic")
        .eq("user_id", user.id)
        .gte("timestamp", fourteenDaysAgo.toISOString())
        .lt("timestamp", sevenDaysAgo.toISOString()),
    ]).then(([currentRes, previousRes]) => {
      const current = currentRes.data || [];
      const previous = previousRes.data || [];

      if (current.length === 0) {
        setStats(null);
        setLoading(false);
        return;
      }

      const avgSystolic = Math.round(
        current.reduce((s, r) => s + r.systolic, 0) / current.length
      );
      const avgDiastolic = Math.round(
        current.reduce((s, r) => s + r.diastolic, 0) / current.length
      );

      let trend: "improving" | "stable" | "rising" = "stable";
      let trendValue = 0;
      if (previous.length > 0) {
        const prevAvg =
          previous.reduce((s, r) => s + r.systolic, 0) / previous.length;
        trendValue = Math.round(avgSystolic - prevAvg);
        if (trendValue < -3) trend = "improving";
        else if (trendValue > 3) trend = "rising";
      }

      setStats({
        avgSystolic,
        avgDiastolic,
        trend,
        trendValue,
        readingsCount: current.length,
      });
      setLoading(false);
    });
  }, [user]);

  if (loading) return null;
  if (!stats) return null;

  const trendIcon =
    stats.trend === "improving"
      ? "trending-down"
      : stats.trend === "rising"
        ? "trending-up"
        : "remove";
  const trendColor =
    stats.trend === "improving"
      ? "text-green-600"
      : stats.trend === "rising"
        ? "text-orange-600"
        : "text-gray-500";

  return (
    <Card className="mb-6">
      <CardHeader className="flex-row items-center gap-2">
        <Ionicons name="bar-chart-outline" size={20} color="#5b8def" />
        <Text className="font-semibold text-gray-900">Last 7 Days</Text>
      </CardHeader>
      <CardContent className="pt-0">
        <View className="flex-row items-center justify-between rounded-xl bg-gray-50 p-4">
          <View>
            <Text className="text-xs text-gray-500">Avg BP</Text>
            <Text className="text-xl font-bold text-primary">
              {stats.avgSystolic}/{stats.avgDiastolic}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-xs text-gray-500">Trend</Text>
            <View className="flex-row items-center gap-1">
              <Ionicons
                name={trendIcon as "trending-down"}
                size={18}
                color={
                  stats.trend === "improving"
                    ? "#16a34a"
                    : stats.trend === "rising"
                      ? "#ea580c"
                      : "#6b7280"
                }
              />
              <Text className={`font-semibold ${trendColor}`}>
                {stats.trend === "improving"
                  ? `−${Math.abs(stats.trendValue)}`
                  : stats.trend === "rising"
                    ? `+${stats.trendValue}`
                    : "Stable"}
              </Text>
            </View>
          </View>
        </View>
        <Text className="mt-2 text-xs text-gray-500">
          {stats.readingsCount} reading{stats.readingsCount !== 1 ? "s" : ""} in
          the last 7 days
        </Text>
      </CardContent>
    </Card>
  );
}
