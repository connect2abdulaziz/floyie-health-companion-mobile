import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useInsights } from "@/hooks/useInsights";
import { useContentPadding } from "@/hooks/useContentPadding";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { InsightCard } from "@/components/insights/InsightCard";
import { Card, CardContent } from "@/components/ui/Card";

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const contentPadding = useContentPadding();
  const router = useRouter();
  const {
    insights,
    readings,
    loading,
    error,
    generating,
    refetch,
    generateMissing,
    hasReadingsWithoutInsights,
  } = useInsights();

  if (loading && insights.length === 0) {
    return (
      <View
        className="flex-1 items-center justify-center bg-white"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <ActivityIndicator size="large" color="#5b8def" />
        <Text className="mt-4 text-base text-gray-500">
          Loading your insights…
        </Text>
      </View>
    );
  }

  if (error && insights.length === 0) {
    return (
      <View
        className="flex-1 items-center justify-center bg-white px-6"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <Text className="text-center text-base text-gray-700">{error}</Text>
        <TouchableOpacity
          onPress={refetch}
          className="mt-4 rounded-xl bg-primary px-6 py-3"
          activeOpacity={0.9}
        >
          <Text className="font-semibold text-white">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const showNoReadings = readings.length === 0;
  const showNoInsights = readings.length > 0 && insights.length === 0;
  const showList = insights.length > 0;

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={contentPadding}
      refreshControl={
        <RefreshControl
          refreshing={loading && insights.length > 0}
          onRefresh={refetch}
          tintColor="#5b8def"
        />
      }
      showsVerticalScrollIndicator={false}
    >
      <View className="mb-2 flex-row items-center gap-2">
        <Ionicons name="trending-up" size={28} color="#5b8def" />
        <Text className="text-2xl font-bold text-gray-900">Health Insights</Text>
      </View>
      <Text className="mb-6 text-base text-gray-500">
        AI-powered analysis of your blood pressure trends
      </Text>

      <Card className="mb-6 border-gray-200 bg-gray-50">
        <CardContent className="py-3 px-4">
          <Text className="text-center text-xs text-gray-500">
            <Text className="font-medium text-gray-600">Flo is not a doctor.</Text>{" "}
            Insights are educational only and not medical advice. Always consult a
            healthcare professional for medical concerns.
          </Text>
        </CardContent>
      </Card>

      {/* Quick Links - one card per row */}
      <View className="mb-6 gap-3">
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push("/insights/wearables")}
        >
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="flex-row items-center justify-between py-4">
              <View className="flex-row items-center gap-3">
                <View className="rounded-xl bg-primary/10 p-2">
                  <Ionicons name="watch-outline" size={22} color="#5b8def" />
                </View>
                <View>
                  <Text className="font-medium text-gray-900">Wearable Metrics</Text>
                  <Text className="text-sm text-gray-500">HRV, sleep, steps, stress</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </CardContent>
          </Card>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push("/insights/flo-history")}
        >
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="flex-row items-center justify-between py-4">
              <View className="flex-row items-center gap-3">
                <View className="rounded-xl bg-primary/10 p-2">
                  <Ionicons name="sparkles" size={22} color="#5b8def" />
                </View>
                <View>
                  <Text className="font-medium text-gray-900">Flo AI History</Text>
                  <Text className="text-sm text-gray-500">Past suggestions from Flo</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </CardContent>
          </Card>
        </TouchableOpacity>
      </View>

      {showNoReadings && (
        <EmptyState
          icon="calendar-outline"
          title="We need a few days of readings"
          description="Keep logging your blood pressure daily to build your personalized AI health insights."
          action={{
            label: "Add Reading",
            onPress: () => router.push("/add-reading"),
          }}
        />
      )}

      {showNoInsights && (
        <EmptyState
          icon="bulb-outline"
          title="No AI insights yet"
          description="Generate your first personalized health insights based on your readings."
          action={{
            label: generating ? "Generating…" : "Generate Insights Now",
            onPress: generating ? undefined : generateMissing,
          }}
        />
      )}

      {showList && (
        <>
          {hasReadingsWithoutInsights && (
            <Card className="mb-4 border-primary/20 bg-primary/5">
              <CardContent className="flex-row items-center justify-between py-4">
                <Text className="flex-1 text-sm text-gray-600">
                  Some readings don't have insights yet.
                </Text>
                <TouchableOpacity
                  onPress={generateMissing}
                  disabled={generating}
                  className="ml-3 flex-row items-center gap-2 rounded-lg bg-primary px-3 py-2"
                  activeOpacity={0.9}
                >
                  {generating ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="refresh" size={18} color="#fff" />
                  )}
                  <Text className="text-sm font-medium text-white">
                    {generating ? "Generating…" : "Generate"}
                  </Text>
                </TouchableOpacity>
              </CardContent>
            </Card>
          )}

          <View className="gap-4">
            {insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}
