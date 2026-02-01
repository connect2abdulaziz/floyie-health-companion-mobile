import { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import {
  calculateFloScore,
  saveFloScore,
  getLatestFloScore,
  type FloScoreResult,
} from "@/services/floScore";
import { Card, CardContent } from "@/components/ui/Card";

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  if (score >= 40) return "text-orange-600";
  return "text-red-600";
}

function getScoreBg(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
}

function getStatusText(score: number, trend: "up" | "stable" | "down"): string {
  if (score >= 80)
    return trend === "up" ? "Excellent & Improving" : trend === "down" ? "Good (slight dip)" : "Excellent";
  if (score >= 60)
    return trend === "up" ? "Improving" : trend === "down" ? "Needs attention" : "Stable";
  if (score >= 40) return "Elevated risk";
  return "High risk";
}

export function FloScoreCard() {
  const router = useRouter();
  const { user } = useAuth();
  const [result, setResult] = useState<FloScoreResult | null>(null);
  const [loading, setLoading] = useState(true);

  const loadScore = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      let data = await getLatestFloScore(user.id);
      const today = new Date().toISOString().split("T")[0];
      if (!data || data.score_date !== today) {
        data = await calculateFloScore(user.id);
        await saveFloScore(user.id, data);
      }
      setResult(data);
    } catch (_) {
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadScore();
  }, [loadScore]);

  if (loading) {
    return (
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <View className="flex-row items-center gap-4">
            <ActivityIndicator size="small" color="#5b8def" />
            <Text className="text-sm text-gray-500">Loading Flo Score…</Text>
          </View>
        </CardContent>
      </Card>
    );
  }

  if (!result) return null;

  const score = result.score;
  const trend = result.trend;
  const trendIcon =
    trend === "up" ? "trending-up" : trend === "down" ? "trending-down" : "remove";
  const trendColor =
    trend === "up" ? "text-green-600" : trend === "down" ? "text-red-500" : "text-gray-500";

  return (
    <TouchableOpacity
      onPress={() => router.push("/(tabs)/insights")}
      activeOpacity={0.9}
    >
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <View className="flex-row items-center gap-4">
            <View
              className={`h-14 w-14 items-center justify-center rounded-full ${getScoreBg(score)}`}
            >
              <Text className="text-xl font-bold text-white">{score}</Text>
            </View>
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <Ionicons name="sparkles" size={18} color="#5b8def" />
                <Text className="font-semibold text-gray-900">Flo Score</Text>
              </View>
              <View className="mt-1 flex-row items-center gap-1">
                <Ionicons name={trendIcon as "trending-up"} size={14} color={trend === "up" ? "#16a34a" : trend === "down" ? "#ef4444" : "#6b7280"} />
                <Text className={`text-sm font-medium ${trendColor}`}>
                  {getStatusText(score, trend)}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  );
}
