import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card";
import type { Insight } from "@/services/insights";

interface InsightCardProps {
  insight: Insight;
}

function formatInsightDate(timestamp: string): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function InsightCard({ insight }: InsightCardProps) {
  const hasReading = insight.reading != null;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="flex-row flex-wrap items-center justify-between gap-2">
          <View className="flex-row items-center gap-2">
            <Ionicons name="bulb" size={20} color="#5b8def" />
            <Text className="font-semibold text-gray-900">AI Health Insight</Text>
          </View>
          {hasReading && (
            <Text className="text-sm font-normal text-gray-500">
              {formatInsightDate(insight.reading!.timestamp)}
            </Text>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="gap-3 pt-0">
        {hasReading && (
          <View className="flex-row flex-wrap gap-3">
            <View className="rounded-lg bg-white/80 px-2 py-1">
              <Text className="text-sm">
                <Text className="font-semibold text-gray-900">
                  {insight.reading!.systolic}/{insight.reading!.diastolic}
                </Text>
                <Text className="text-gray-500"> mmHg</Text>
              </Text>
            </View>
            <View className="rounded-lg bg-white/80 px-2 py-1">
              <Text className="text-sm">
                <Text className="font-semibold text-gray-900">
                  {insight.reading!.heart_rate}
                </Text>
                <Text className="text-gray-500"> bpm</Text>
              </Text>
            </View>
          </View>
        )}
        <Text className="text-sm leading-relaxed text-gray-700">
          {insight.generated_text}
        </Text>
      </CardContent>
    </Card>
  );
}
