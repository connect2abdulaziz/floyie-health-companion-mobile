import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useContentPadding } from "@/hooks/useContentPadding";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, type AuthRole } from "@/hooks/useAuth";
import { supabase } from "@/services/supabase";
import {
  getActiveAlerts,
  markAlertAsRead,
  analyzeAndGenerateAlerts,
  saveAlerts,
  type Alert,
} from "@/services/alerts";
import { RemindersCard } from "@/components/dashboard/RemindersCard";
import { FloScoreCard } from "@/components/dashboard/FloScoreCard";
import { WeeklyBPOverviewCard } from "@/components/dashboard/WeeklyBPOverviewCard";
import { SmartRemindersCard } from "@/components/dashboard/SmartRemindersCard";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card";
import { BPZoneBadge } from "@/components/dashboard/BPZoneBadge";
import { EmptyState } from "@/components/dashboard/EmptyState";

interface Reading {
  id: string;
  systolic: number;
  diastolic: number;
  heart_rate: number;
  timestamp: string;
  notes?: string;
  source?: string;
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const contentPadding = useContentPadding();
  const { user } = useAuth();
  const [role, setRole] = useState<AuthRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [latestReading, setLatestReading] = useState<Reading | null>(null);
  const [morningLogged, setMorningLogged] = useState(false);
  const [eveningLogged, setEveningLogged] = useState(false);
  const [aiInsight, setAiInsight] = useState<string>("");
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadDashboardData = useCallback(async () => {
    if (!user) return;

    setError(null);
    try {
      // Latest reading
      const { data: latest, error: readingError } = await supabase
        .from("readings")
        .select("*")
        .eq("user_id", user.id)
        .order("timestamp", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (readingError) throw readingError;

      if (latest) {
        setLatestReading(latest);

        // Latest insight: insights table first, then ai_insights fallback
        const { data: latestInsight } = await supabase
          .from("insights")
          .select("insight_text")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (latestInsight?.insight_text) {
          setAiInsight(latestInsight.insight_text);
        } else {
          const { data: legacyInsight } = await supabase
            .from("ai_insights")
            .select("generated_text")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          if (legacyInsight?.generated_text) {
            setAiInsight(legacyInsight.generated_text);
          } else {
            setAiInsight("");
          }
        }

        // Today's readings for morning/evening
        const todayStart = new Date().toISOString().split("T")[0];
        const { data: todaysReadings } = await supabase
          .from("readings")
          .select("timestamp")
          .eq("user_id", user.id)
          .gte("timestamp", todayStart);

        if (todaysReadings?.length) {
          const hasMorning = todaysReadings.some((r) => {
            const hour = new Date(r.timestamp).getHours();
            return hour < 12;
          });
          const hasEvening = todaysReadings.some((r) => {
            const hour = new Date(r.timestamp).getHours();
            return hour >= 17;
          });
          setMorningLogged(hasMorning);
          setEveningLogged(hasEvening);
        } else {
          setMorningLogged(false);
          setEveningLogged(false);
        }
      } else {
        setLatestReading(null);
        setAiInsight("");
        setMorningLogged(false);
        setEveningLogged(false);
      }

      // Alerts: load active; optionally generate in background (like web)
      const activeAlerts = await getActiveAlerts(user.id);
      setAlerts(activeAlerts);

      try {
        const generated = await analyzeAndGenerateAlerts(user.id);
        if (generated.length > 0) await saveAlerts(user.id, generated);
        const refreshed = await getActiveAlerts(user.id);
        setAlerts(refreshed);
      } catch (_) {
        // non-blocking
      }
    } catch (err) {
      console.error("Dashboard load error:", err);
      setError(
        "We couldn't load your data right now. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  const fetchRoleAndData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: roleRow, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (roleError) throw roleError;

      const resolvedRole: AuthRole = (roleRow?.role as AuthRole) ?? "user";
      setRole(resolvedRole);

      if (resolvedRole === "caregiver" || resolvedRole === "doctor") {
        setLoading(false);
        return;
      }

      await loadDashboardData();
    } catch (err) {
      console.error("Dashboard init error:", err);
      setError(
        "We couldn't load your data right now. Please check your connection and try again."
      );
      setLoading(false);
    }
  }, [user, loadDashboardData]);

  useEffect(() => {
    if (user) {
      fetchRoleAndData();
    } else {
      setLoading(false);
    }
  }, [user, fetchRoleAndData]);

  // Redirect doctor to doctor dashboard
  useEffect(() => {
    if (role === "doctor") {
      router.replace("/(doctor)" as any);
    }
  }, [role, router]);

  const onRefresh = useCallback(() => {
    if (role === "caregiver" || role === "doctor") return;
    setRefreshing(true);
    loadDashboardData();
  }, [role, loadDashboardData]);

  // Full-screen loading
  if (loading && role === null) {
    return (
      <View
        className="flex-1 items-center justify-center bg-white"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <ActivityIndicator size="large" color="#9333ea" />
        <Text className="mt-4 text-base text-gray-600">
          Loading your health dashboard…
        </Text>
      </View>
    );
  }

  // Show loading while doctor redirect is happening
  if (role === "doctor") {
    return (
      <View
        className="flex-1 items-center justify-center bg-white"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <ActivityIndicator size="large" color="#9333ea" />
      </View>
    );
  }

  // Role stub: caregiver
  if (role === "caregiver") {
    return (
      <View
        className="flex-1 items-center justify-center bg-white px-6"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <Text className="text-center text-xl font-semibold text-gray-900">
          Caregiver Dashboard
        </Text>
        <Text className="mt-2 text-center text-gray-500">
          Coming soon. You're signed in as a caregiver.
        </Text>
      </View>
    );
  }

  // Error state with retry
  if (error) {
    return (
      <View
        className="flex-1 items-center justify-center bg-white px-6"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <Text className="text-center text-base text-gray-700">{error}</Text>
        <TouchableOpacity
          onPress={() => {
            setLoading(true);
            fetchRoleAndData();
          }}
          className="mt-4 rounded-xl bg-primary px-6 py-3"
          activeOpacity={0.9}
        >
          <Text className="text-base font-semibold text-white">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Patient dashboard: scroll layout with welcome (Phase 1 foundation)
  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={contentPadding}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#9333ea"
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Welcome section */}
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-900">Welcome back!</Text>
        <Text className="mt-1 text-base text-gray-500">
          Here's your blood pressure overview
        </Text>
      </View>

      {/* Reminders card */}
      <View className="mb-4">
        <RemindersCard morningLogged={morningLogged} eveningLogged={eveningLogged} />
      </View>

      {/* Quick actions */}
      <View className="mb-4 flex-row gap-3">
        <TouchableOpacity
          onPress={() => router.push("/add-reading")}
          className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-primary py-3.5"
          activeOpacity={0.9}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text className="font-semibold text-white">Add Reading</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("/medications")}
          className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-primary bg-transparent py-3.5"
          activeOpacity={0.9}
        >
          <Ionicons name="medical" size={20} color="#5b8def" />
          <Text className="font-semibold text-primary">Medications</Text>
        </TouchableOpacity>
      </View>

      {/* Quick links */}
      <View className="mb-6 flex-row gap-3">
        <TouchableOpacity
          onPress={() => router.push("/messages")}
          className="flex-1 rounded-xl border border-gray-200 bg-white p-4"
          activeOpacity={0.9}
        >
          <View className="items-center">
            <View className="mb-2 rounded-full bg-primary/10 p-2">
              <Ionicons name="chatbubbles-outline" size={24} color="#5b8def" />
            </View>
            <Text className="text-sm font-medium text-gray-900">Messages</Text>
            <Text className="text-xs text-gray-500">Care Team</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("/symptoms")}
          className="flex-1 rounded-xl border border-gray-200 bg-white p-4"
          activeOpacity={0.9}
        >
          <View className="items-center">
            <View className="mb-2 rounded-full bg-primary/10 p-2">
              <Ionicons name="pulse-outline" size={24} color="#5b8def" />
            </View>
            <Text className="text-sm font-medium text-gray-900">Symptoms</Text>
            <Text className="text-xs text-gray-500">Log & Track</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("/programs")}
          className="flex-1 rounded-xl border border-gray-200 bg-white p-4"
          activeOpacity={0.9}
        >
          <View className="items-center">
            <View className="mb-2 rounded-full bg-primary/10 p-2">
              <Ionicons name="flag-outline" size={24} color="#5b8def" />
            </View>
            <Text className="text-sm font-medium text-gray-900">Programs</Text>
            <Text className="text-xs text-gray-500">Lifestyle</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Flo Score card */}
      <View className="mb-4">
        <FloScoreCard />
      </View>

      {/* Weekly BP overview */}
      <View className="mb-4">
        <WeeklyBPOverviewCard />
      </View>

      {/* Smart reminders */}
      <View className="mb-4">
        <SmartRemindersCard />
      </View>

      {/* Latest reading card */}
      {latestReading ? (
        <Card className="mb-6">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>
              <Text className="font-semibold text-gray-900">Latest Reading</Text>
            </CardTitle>
            <BPZoneBadge
              systolic={latestReading.systolic}
              diastolic={latestReading.diastolic}
              size="sm"
            />
          </CardHeader>
          <CardContent className="pt-0">
            <Text className="mb-3 text-xs text-gray-500">
              {new Date(latestReading.timestamp).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </Text>
            <View className="flex-row gap-3">
              <View className="flex-1 items-center rounded-xl bg-primary/5 py-4">
                <Text className="text-2xl font-bold text-primary">
                  {latestReading.systolic}
                </Text>
                <Text className="text-xs text-gray-500">Systolic</Text>
              </View>
              <View className="flex-1 items-center rounded-xl bg-primary/5 py-4">
                <Text className="text-2xl font-bold text-primary">
                  {latestReading.diastolic}
                </Text>
                <Text className="text-xs text-gray-500">Diastolic</Text>
              </View>
              <View className="flex-1 items-center rounded-xl bg-primary/5 py-4">
                <Text className="text-2xl font-bold text-primary">
                  {latestReading.heart_rate}
                </Text>
                <Text className="text-xs text-gray-500">Heart Rate</Text>
              </View>
            </View>
            {latestReading.notes ? (
              <View className="mt-3 rounded-lg bg-gray-50 p-3">
                <Text className="text-sm italic text-gray-600">
                  {latestReading.notes}
                </Text>
              </View>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <View className="mb-6">
          <EmptyState
            icon="pulse-outline"
            title="No readings yet"
            description="Let's add your first blood pressure reading to start tracking your health."
            action={{ label: "Add First Reading", onPress: () => router.push("/add-reading") }}
          />
        </View>
      )}

      {/* AI insight card */}
      {aiInsight ? (
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>
              <Ionicons name="sparkles" size={20} color="#5b8def" />
              <Text className="font-semibold text-gray-900">AI Health Insight</Text>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Text className="text-sm leading-relaxed text-gray-700">{aiInsight}</Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/insights")}
              className="mt-3"
              activeOpacity={0.8}
            >
              <Text className="text-sm font-medium text-primary">View all insights</Text>
            </TouchableOpacity>
          </CardContent>
        </Card>
      ) : null}

      {/* Alerts card */}
      <Card className="mb-8">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>
            <Ionicons name="notifications-outline" size={20} color="#374151" />
            <Text className="font-semibold text-gray-900">Your Alerts</Text>
            {alerts.length > 0 ? (
              <View className="ml-2 rounded-full bg-primary px-2 py-0.5">
                <Text className="text-xs font-medium text-white">{alerts.length}</Text>
              </View>
            ) : null}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {alerts.length === 0 ? (
            <View className="items-center py-8">
              <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
              <Text className="mt-3 font-medium text-gray-700">No active alerts</Text>
              <Text className="mt-1 text-sm text-gray-500">Your readings look good!</Text>
            </View>
          ) : (
            <View className="gap-3">
              {alerts.map((alert) => (
                <View
                  key={alert.id}
                  className={`flex-row items-start gap-3 rounded-lg border p-3 ${
                    alert.severity === "critical"
                      ? "border-red-200 bg-red-50"
                      : alert.severity === "high"
                        ? "border-orange-200 bg-orange-50"
                        : alert.severity === "medium"
                          ? "border-amber-200 bg-amber-50"
                          : "border-blue-200 bg-blue-50"
                  }`}
                >
                  <Ionicons
                    name={
                      alert.severity === "critical"
                        ? "warning"
                        : alert.severity === "high"
                          ? "alert-circle"
                          : "information-circle-outline"
                    }
                    size={20}
                    color={
                      alert.severity === "critical"
                        ? "#dc2626"
                        : alert.severity === "high"
                          ? "#ea580c"
                          : alert.severity === "medium"
                            ? "#d97706"
                            : "#2563eb"
                    }
                  />
                  <View className="flex-1 min-w-0">
                    <Text className="text-sm text-gray-900">{alert.message}</Text>
                    <Text className="mt-1 text-xs text-gray-500">
                      {new Date(alert.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={async () => {
                      await markAlertAsRead(alert.id);
                      setAlerts((prev) => prev.filter((a) => a.id !== alert.id));
                    }}
                    className="p-1"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close" size={20} color="#6b7280" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </CardContent>
      </Card>
    </ScrollView>
  );
}
