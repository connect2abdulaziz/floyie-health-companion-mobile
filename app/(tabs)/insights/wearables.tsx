import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { useContentPadding } from "@/hooks/useContentPadding";
import {
  fetchWearablesDashboard,
  getSourceDisplayName,
  type WearablesDashboardData,
  type MetricSummary,
} from "@/services/wearables";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/dashboard/EmptyState";

const METRIC_CONFIG: {
  key: keyof Pick<WearablesDashboardData, "hrv" | "sleep" | "steps" | "stress">;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  unitLabel: string;
}[] = [
  { key: "hrv", title: "HRV", icon: "pulse-outline", unitLabel: "ms" },
  { key: "sleep", title: "Sleep", icon: "moon-outline", unitLabel: "hrs" },
  { key: "steps", title: "Steps", icon: "walk-outline", unitLabel: "" },
  { key: "stress", title: "Stress", icon: "flash-outline", unitLabel: "" },
];

function TrendIcon({ trend }: { trend: "up" | "down" | "stable" | null }) {
  if (trend === "up") return <Ionicons name="trending-up" size={18} color="#22c55e" />;
  if (trend === "down") return <Ionicons name="trending-down" size={18} color="#ef4444" />;
  if (trend === "stable") return <Ionicons name="remove" size={18} color="#9ca3af" />;
  return null;
}

function MetricCard({
  title,
  icon,
  metric,
  unitLabel,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  metric: MetricSummary;
  unitLabel: string;
}) {
  const hasData = metric.latest !== null;
  if (!hasData) {
    return (
      <Card className="border-gray-100">
        <CardContent className="py-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Ionicons name={icon} size={20} color="#9ca3af" />
              <Text className="font-medium text-gray-500">{title}</Text>
            </View>
            <Text className="text-sm text-gray-400">No data</Text>
          </View>
        </CardContent>
      </Card>
    );
  }
  const value = metric.latest!.value;
  const unit = metric.latest!.unit || unitLabel;
  const source = getSourceDisplayName(metric.latest!.source);
  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-1">
        <CardTitle className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Ionicons name={icon} size={20} color="#5b8def" />
            <Text className="text-base font-semibold text-gray-900">{title}</Text>
          </View>
          <TrendIcon trend={metric.trend} />
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Text className="text-2xl font-bold text-gray-900">
          {value}
          {unit ? ` ${unit}` : ""}
        </Text>
        {metric.average != null && (
          <Text className="mt-1 text-sm text-gray-500">
            7-day avg: {metric.average}
            {unit ? ` ${unit}` : ""}
          </Text>
        )}
        <Text className="mt-1 text-xs text-gray-400">{source}</Text>
      </CardContent>
    </Card>
  );
}

export default function WearablesScreen() {
  const insets = useSafeAreaInsets();
  const contentPadding = useContentPadding({ stackScreen: true });
  const { user } = useAuth();
  const [data, setData] = useState<WearablesDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const result = await fetchWearablesDashboard(user.id);
    setData(result);
  }, [user]);

  useEffect(() => {
    if (user) {
      setLoading(true);
      load().finally(() => setLoading(false));
    } else {
      setData(null);
      setLoading(false);
    }
  }, [user, load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  if (loading && !data) {
    return (
      <View
        className="flex-1 items-center justify-center bg-white"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <ActivityIndicator size="large" color="#5b8def" />
        <Text className="mt-4 text-base text-gray-500">Loading metrics…</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View
        className="flex-1 items-center justify-center bg-white px-6"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <Text className="text-center text-base text-gray-600">Sign in to view wearable metrics.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={contentPadding}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#5b8def" />
      }
      showsVerticalScrollIndicator={false}
    >
      <Text className="mb-4 text-base text-gray-500">
        HRV, sleep, steps, and stress from connected devices
      </Text>

      {data && !data.hasAnyData && (
        <EmptyState
          icon="watch-outline"
          title="No wearable data yet"
          description="Connect a device or sync Apple Health / Google Fit to see metrics here."
        />
      )}

      {data?.hasAnyData && (
        <View className="gap-4">
          {METRIC_CONFIG.map(({ key, title, icon, unitLabel }) => (
            <MetricCard
              key={key}
              title={title}
              icon={icon}
              metric={data[key]}
              unitLabel={unitLabel}
            />
          ))}
        </View>
      )}

      <Card className="mt-6 border-gray-200 bg-gray-50">
        <CardContent className="py-3 px-4">
          <Text className="text-center text-xs text-gray-500">
            Wearable data is for general wellness only. Consult a doctor for medical advice.
          </Text>
        </CardContent>
      </Card>
    </ScrollView>
  );
}
