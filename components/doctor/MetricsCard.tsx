import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PatientMetrics, RiskLevel, TrendDirection, Variability } from "@/services/doctor";

interface MetricsCardProps {
  metrics: PatientMetrics | null;
  loading?: boolean;
}

// Risk level styling
const riskStyles: Record<RiskLevel, { bg: string; text: string; label: string }> = {
  low: { bg: "bg-green-100", text: "text-green-700", label: "Low Risk" },
  moderate: { bg: "bg-amber-100", text: "text-amber-700", label: "Moderate" },
  high: { bg: "bg-red-100", text: "text-red-700", label: "High Risk" },
};

// Trend icons and colors
const trendConfig: Record<TrendDirection, { icon: keyof typeof Ionicons.glyphMap; color: string; label: string }> = {
  improving: { icon: "trending-down", color: "#16a34a", label: "Improving" },
  stable: { icon: "remove", color: "#6b7280", label: "Stable" },
  worsening: { icon: "trending-up", color: "#dc2626", label: "Worsening" },
};

export function MetricsCard({ metrics, loading }: MetricsCardProps) {
  if (loading) {
    return (
      <View className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <Text className="text-center text-gray-500">Loading metrics...</Text>
      </View>
    );
  }

  if (!metrics) {
    return (
      <View className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <View className="items-center py-4">
          <Ionicons name="analytics-outline" size={32} color="#9ca3af" />
          <Text className="mt-2 text-center text-gray-500">
            No readings in the past 7 days
          </Text>
        </View>
      </View>
    );
  }

  const risk = riskStyles[metrics.riskLevel];
  const trend = trendConfig[metrics.trend];

  return (
    <View className="gap-3">
      {/* Main BP and Risk */}
      <View className="flex-row gap-3">
        {/* Average BP */}
        <View className="flex-1 rounded-xl border border-gray-200 bg-white p-4">
          <Text className="text-xs font-medium text-gray-500">AVG BP (7D)</Text>
          <Text className="mt-1 text-2xl font-bold text-gray-900">
            {metrics.avgSystolic}/{metrics.avgDiastolic}
          </Text>
          <Text className="text-xs text-gray-400">mmHg</Text>
        </View>

        {/* Risk Level */}
        <View className={`flex-1 rounded-xl border border-gray-200 p-4 ${risk.bg}`}>
          <Text className="text-xs font-medium text-gray-500">RISK LEVEL</Text>
          <Text className={`mt-1 text-lg font-bold ${risk.text}`}>
            {risk.label}
          </Text>
          <Text className="text-xs text-gray-500">
            {metrics.readingsCount} readings
          </Text>
        </View>
      </View>

      {/* Secondary metrics */}
      <View className="flex-row gap-3">
        {/* Trend */}
        <View className="flex-1 rounded-xl border border-gray-200 bg-white p-4">
          <Text className="text-xs font-medium text-gray-500">TREND</Text>
          <View className="mt-1 flex-row items-center gap-1">
            <Ionicons name={trend.icon} size={20} color={trend.color} />
            <Text className="text-base font-semibold text-gray-900">
              {trend.label}
            </Text>
          </View>
          <Text className="text-xs text-gray-400">vs last week</Text>
        </View>

        {/* Heart Rate */}
        <View className="flex-1 rounded-xl border border-gray-200 bg-white p-4">
          <Text className="text-xs font-medium text-gray-500">AVG HR</Text>
          <View className="mt-1 flex-row items-baseline gap-1">
            <Text className="text-2xl font-bold text-gray-900">
              {metrics.avgHeartRate}
            </Text>
            <Text className="text-xs text-gray-400">bpm</Text>
          </View>
        </View>

        {/* Flo Score */}
        <View className="flex-1 rounded-xl border border-gray-200 bg-white p-4">
          <Text className="text-xs font-medium text-gray-500">FLO SCORE</Text>
          <Text className="mt-1 text-2xl font-bold text-primary">
            {metrics.floScore ?? "—"}
          </Text>
          <Text className="text-xs text-gray-400">
            {metrics.floScore !== null
              ? metrics.floScore >= 80
                ? "Excellent"
                : metrics.floScore >= 60
                  ? "Good"
                  : "Needs work"
              : "N/A"}
          </Text>
        </View>
      </View>

      {/* Compliance bar */}
      <View className="rounded-xl border border-gray-200 bg-white p-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-xs font-medium text-gray-500">COMPLIANCE</Text>
          <Text className="text-sm font-semibold text-gray-900">
            {metrics.compliance}%
          </Text>
        </View>
        <View className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
          <View
            className="h-full rounded-full bg-primary"
            style={{ width: `${metrics.compliance}%` }}
          />
        </View>
        <Text className="mt-1 text-xs text-gray-400">
          {metrics.readingsCount} of 14 expected readings this week
        </Text>
      </View>
    </View>
  );
}
